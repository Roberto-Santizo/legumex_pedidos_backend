// Created by Luis

import { Between, EntityManager, In, Repository } from 'typeorm';
import appDatasource from '../../config/datasource';
import { ContainerDatasource, CreateContainerInput, WeekViewData } from '../../domain/datasources/ContainerDatasource';
import { Container, ContainerStatus } from '../../entities/Container';
import { ContainerOrder } from '../../entities/ContainerOrder';
import { Order } from '../../entities/Order';
import { User } from '../../entities/User';
import { Carrier } from '../../entities/Carrier';
import { NotFoundError } from '../errors/errors';

export class ContainerDatasourceImpl implements ContainerDatasource {
    private containerRepo: Repository<Container>;
    private containerOrderRepo: Repository<ContainerOrder>;
    private orderRepo: Repository<Order>;

    constructor() {
        this.containerRepo = appDatasource.getRepository(Container);
        this.containerOrderRepo = appDatasource.getRepository(ContainerOrder);
        this.orderRepo = appDatasource.getRepository(Order);
    }

    // --- Read operations ---
    

    async getWeekView(weekStart: string, weekEnd: string): Promise<WeekViewData> {
        // Load all status=3 orders whose requiredByDate falls inside the week.
        // 'client' is not eager so we must load it explicitly.
        // 'products' (OrderProduct) also not eager; Product inside OrderProduct IS eager.
        const orders = await this.orderRepo.find({
            where: { status: 3, requiredByDate: Between(new Date(weekStart + 'T00:00:00'), new Date(weekEnd + 'T23:59:59')) },
            relations: ['client', 'products'],
            order: { id: 'DESC' },
        });

        // Load all containers for this week with full nested relations
        const containers = await this.containerRepo.find({
            where: { weekStart, weekEnd },
            relations: [
                'containerOrders',
                'containerOrders.order',
                'containerOrders.order.client',
                'containerOrders.order.products',
                'createdBy',
                'confirmedBy',
                'carrier',
            ],
            order: { id: 'DESC' },
        });

        return { orders, containers };
    }

    async getAvailableOrders(weekStart: string, weekEnd: string): Promise<Order[]> {
        // Find all order IDs already assigned to a container
        const assignedRows = await this.containerOrderRepo.find({ select: ['orderId'] });
        const assignedIds = assignedRows.map((co) => co.orderId);

        const query = this.orderRepo
            .createQueryBuilder('o')
            .where('o.status = :status', { status: 3 })
            .andWhere('o.requiredByDate BETWEEN :start AND :end', {
                start: weekStart,
                end: weekEnd,
            });

        // Exclude already-assigned orders only if there are any
        if (assignedIds.length > 0) {
            query.andWhere('o.id NOT IN (:...ids)', { ids: assignedIds });
        }

        return query.getMany();
    }

    async findContainerById(id: number): Promise<Container | null> {
        return this.containerRepo.findOneBy({ id });
    }

    async findOrdersByIds(orderIds: number[]): Promise<Order[]> {
        if (orderIds.length === 0) return [];
        return this.orderRepo.findBy({ id: In(orderIds) });
    }

    async findOrdersAlreadyInContainer(orderIds: number[]): Promise<number[]> {
        if (orderIds.length === 0) return [];
        const rows = await this.containerOrderRepo.findBy({ orderId: In(orderIds) });
        return rows.map((r) => r.orderId);
    }

    async isOrderInContainer(containerId: number, orderId: number): Promise<boolean> {
        const count = await this.containerOrderRepo.countBy({ containerId, orderId });
        return count > 0;
    }

    async getContainerWithDetails(id: number): Promise<Container | null> {
        return this.containerRepo.findOne({
            where: { id },
            relations: [
                'containerOrders',
                'containerOrders.order',
                'containerOrders.order.client',
                'containerOrders.order.products',
                'createdBy',
                'confirmedBy',
                'carrier',
            ],
        });
    }

    async assignCarrier(containerId: number, carrierId: number): Promise<Container> {
        const carrierRepo = appDatasource.getRepository(Carrier);
        const carrier = await carrierRepo.findOneBy({ id: carrierId });
        if (!carrier) throw new NotFoundError('Carrier not found');

        await this.containerRepo.update(
            { id: containerId },
            {
                carrier: { id: carrierId },
                carrierCostSnapshot: Number(carrier.shippingCost),
            },
        );

        // Status 5: orders now have a carrier assigned
        const orderRows = await this.containerOrderRepo.findBy({ containerId });
        const orderIds = orderRows.map((co) => co.orderId);
        if (orderIds.length > 0) {
            await this.orderRepo.update({ id: In(orderIds) }, { status: 5 });
        }

        return this.getContainerWithDetails(containerId);
    }

    // --- Write operations (all mutations use transactions) ---

    async createContainer(input: CreateContainerInput): Promise<Container> {
        return appDatasource.manager.transaction(async (manager) => {
            const orders = await manager.findBy(Order, { id: In(input.orderIds) });

            // Compute denormalized totals from the actual order values
            const totalPallets = orders.reduce((sum, o) => sum + o.total_pallets, 0);
            const totalPounds = orders.reduce((sum, o) => sum + o.total_lbs, 0);

            // Insert the container row
            const container = manager.create(Container, {
                transportType: input.transportType,
                dc: input.dc,
                weekStart: input.weekStart,
                weekEnd: input.weekEnd,
                status: ContainerStatus.DRAFT,
                totalPallets,
                totalPounds,
                totalOrders: orders.length,
                createdBy: { id: input.createdById } as User,
            });
            const saved = await manager.save(container);

            // Insert one ContainerOrder row per order (with snapshot values)
            for (const order of orders) {
                const co = manager.create(ContainerOrder, {
                    containerId: saved.id,
                    orderId: order.id,
                    addedBy: { id: input.createdById } as User,
                    snapshotPallets: order.total_pallets,
                    snapshotPounds: order.total_lbs,
                });
                await manager.save(co);
            }

            // Status 4: order is now assigned to a container
            if (orders.length > 0) {
                await manager.update(Order, { id: In(input.orderIds) }, { status: 4 });
            }

            return saved;
        });
    }

    async addOrdersToContainer(
        containerId: number,
        orderIds: number[],
        addedById: number,
    ): Promise<Container> {
        await appDatasource.manager.transaction(async (manager) => {
            const orders = await manager.findBy(Order, { id: In(orderIds) });

            for (const order of orders) {
                const co = manager.create(ContainerOrder, {
                    containerId,
                    orderId: order.id,
                    addedBy: { id: addedById } as User,
                    snapshotPallets: order.total_pallets,
                    snapshotPounds: order.total_lbs,
                });
                await manager.save(co);
            }

            // Status 4: order is now assigned to a container
            if (orderIds.length > 0) {
                await manager.update(Order, { id: In(orderIds) }, { status: 4 });
            }

            await this.recalculateTotals(manager, containerId);
        });

        return this.containerRepo.findOneBy({ id: containerId });
    }

    async removeOrderFromContainer(containerId: number, orderId: number): Promise<Container> {
        await appDatasource.manager.transaction(async (manager) => {
            await manager.delete(ContainerOrder, { containerId, orderId });
            // Revert to status 3 so the order becomes available again
            await manager.update(Order, { id: orderId }, { status: 3 });
            await this.recalculateTotals(manager, containerId);
        });

        return this.containerRepo.findOneBy({ id: containerId });
    }

    async confirmContainer(containerId: number, userId: number): Promise<Container> {
        await this.containerRepo.update(
            { id: containerId },
            {
                status: ContainerStatus.CONFIRMED,
                confirmedAt: new Date(),
                confirmedBy: { id: userId } as User,
            },
        );
        return this.containerRepo.findOneBy({ id: containerId });
    }

    async deleteContainer(containerId: number): Promise<void> {
        // Revert all orders to status 3 before the CASCADE removes ContainerOrder rows
        const orderRows = await this.containerOrderRepo.findBy({ containerId });
        const orderIds = orderRows.map((co) => co.orderId);
        if (orderIds.length > 0) {
            await this.orderRepo.update({ id: In(orderIds) }, { status: 3 });
        }

        // CASCADE on ContainerOrder.container will handle the junction rows automatically
        await this.containerRepo.delete({ id: containerId });
    }

    // --- Private helpers ---

    /**
     * Recalculates totalPallets, totalPounds and totalOrders for a container
     * by summing the snapshot values stored in its ContainerOrder rows.
     * Must be called inside an active transaction.
     */
    private async recalculateTotals(manager: EntityManager, containerId: number): Promise<void> {
        const rows = await manager.findBy(ContainerOrder, { containerId });
        const totalPallets = rows.reduce((sum, co) => sum + co.snapshotPallets, 0);
        const totalPounds = rows.reduce((sum, co) => sum + co.snapshotPounds, 0);

        await manager.update(Container, { id: containerId }, {
            totalPallets,
            totalPounds,
            totalOrders: rows.length,
        });
    }
}
