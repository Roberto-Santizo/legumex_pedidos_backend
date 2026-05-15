// Created by Luis

import { ContainerRepository } from '../domain/repositories/ContainerRepository';
import { Container, ContainerStatus } from '../entities/Container';
import { Order, TransportOptions } from '../entities/Order';
import { OrderProduct } from '../entities/OrderProduct';
import { Dc } from '../entities/Dc';
import { BadRequestError, ConflictError, NotFoundError } from '../infrastructure/errors/errors';
import { getCurrentWeekBounds, getISOWeekAndYear, getWeekBounds } from '../utils/week';

// Business rule constants
const MAX_PALLETS = 20;       // standard visual reference
const MAX_POUNDS = 40000;     // standard visual reference
const HARD_MAX_POUNDS = 42000; // absolute weight ceiling — the only hard block
const MIN_POUNDS_WARNING = 20000;

export class ContainerService {
    constructor(private repository: ContainerRepository) { }

    async getWeekContainerSchedule(dateStr: string) {
        // Parse the date at noon to avoid timezone-offset edge cases
        const date = new Date(`${dateStr}T12:00:00`);
        const { start: weekStart, end: weekEnd } = getWeekBounds(date);

        const { start: currentWeekStart, end: currentWeekEnd } = getCurrentWeekBounds();
        const isPastWeek = weekEnd < currentWeekStart;
        const isCurrentWeek = weekStart === currentWeekStart && weekEnd === currentWeekEnd;

        const { orders, containers } = await this.repository.getWeekView(weekStart, weekEnd);

        // Build a set of order IDs that are already inside a container
        const assignedOrderIds = new Set<number>();
        for (const container of containers) {
            for (const containerOrder of container.containerOrders) {
                if (containerOrder.order) assignedOrderIds.add(containerOrder.order.id);
            }
        }

        const availableOrders = orders
            .filter((order) => !assignedOrderIds.has(order.id))
            .map((order) => this.toOrderResponse(order, null));

        return {
            week: { start: weekStart, end: weekEnd },
            isCurrentWeek,
            isReadonly: false,
            availableOrders,
            containers: containers.map((container) => this.toContainerResponse(container)),
        };
    }

    async createContainer(
        input: {
            transportType: TransportOptions;
            dc: string;
            weekStart: string;
            orderIds: number[];
        },
        userId: number,
    ): Promise<Container> {
        const { start: weekStart, end: weekEnd } = getWeekBounds(
            new Date(`${input.weekStart}T12:00:00`),
        );

        const orders = await this.repository.findOrdersByIds(input.orderIds);
        this.validateOrdersExist(input.orderIds, orders.map((order) => order.id));
        this.validateOrdersStatus(orders);
        this.validateOrdersTransportType(orders, input.transportType);
        this.validateOrdersDc(orders, input.dc);
        const { year: weekYear, week: weekNumber } = getISOWeekAndYear(new Date(`${weekStart}T12:00:00`));
        this.validateOrdersInWeek(orders, weekYear, weekNumber);

        const alreadyAssigned = await this.repository.findOrdersAlreadyInContainer(input.orderIds);
        if (alreadyAssigned.length > 0) {
            throw new BadRequestError(
                `The following orders are already assigned to a container: ${alreadyAssigned.join(', ')}`,
            );
        }

        this.validateIndividualLimits(orders);
        this.validateTotalLimits(orders);

        return this.repository.createContainer({
            transportType: input.transportType,
            dc: input.dc,
            weekStart,
            weekEnd,
            createdById: userId,
            orderIds: input.orderIds,
        });
    }

    async addOrders(containerId: number, orderIds: number[], userId: number): Promise<Container> {
        const container = await this.fetchDraftContainerOrThrow(containerId);

        const orders = await this.repository.findOrdersByIds(orderIds);
        this.validateOrdersExist(orderIds, orders.map((order) => order.id));
        this.validateOrdersStatus(orders);
        this.validateOrdersTransportType(orders, container.transportType);
        this.validateOrdersDc(orders, container.dc);
        const { year: weekYear, week: weekNumber } = getISOWeekAndYear(new Date(`${container.weekStart}T12:00:00`));
        this.validateOrdersInWeek(orders, weekYear, weekNumber);

        const alreadyAssigned = await this.repository.findOrdersAlreadyInContainer(orderIds);
        if (alreadyAssigned.length > 0) {
            throw new BadRequestError(
                `The following orders are already assigned to a container: ${alreadyAssigned.join(', ')}`,
            );
        }

        // Check that adding these orders will not exceed the container limits
        const newPounds = orders.reduce((sum, order) => sum + order.total_lbs, 0);

        if (container.totalPounds + newPounds > HARD_MAX_POUNDS) {
            throw new BadRequestError(
                `Adding these orders would exceed the maximum weight limit (${container.totalPounds + newPounds} / ${HARD_MAX_POUNDS.toLocaleString()} lbs)`,
            );
        }

        return this.repository.addOrdersToContainer(containerId, orderIds, userId);
    }


    async removeOrder(containerId: number, orderId: number): Promise<Container> {
        await this.fetchDraftContainerOrThrow(containerId);

        const belongs = await this.repository.isOrderInContainer(containerId, orderId);
        if (!belongs) {
            throw new NotFoundError('The order does not belong to this container');
        }

        return this.repository.removeOrderFromContainer(containerId, orderId);
    }


    async confirmContainer(containerId: number, userId: number) {
        const container = await this.fetchDraftContainerOrThrow(containerId);

        if (container.totalOrders === 0) {
            throw new BadRequestError('The container must have at least one order before confirming');
        }
        if (container.totalPounds > HARD_MAX_POUNDS) {
            throw new BadRequestError(
                `The container exceeds the maximum weight limit (${container.totalPounds.toLocaleString()} / ${HARD_MAX_POUNDS.toLocaleString()} lbs)`,
            );
        }

        // Soft warning — does not block confirmation
        const warning =
            container.totalPounds < MIN_POUNDS_WARNING
                ? `Container is below the recommended minimum weight of ${MIN_POUNDS_WARNING.toLocaleString()} lbs`
                : null;

        const confirmed = await this.repository.confirmContainer(containerId, userId);
        return { container: confirmed, warning };
    }


    async deleteContainer(containerId: number): Promise<void> {
        await this.fetchDraftContainerOrThrow(containerId);
        return this.repository.deleteContainer(containerId);
    }


    async getContainerById(id: number) {
        const container = await this.repository.getContainerWithDetails(id);
        if (!container) throw new NotFoundError('Container not found');
        return this.toContainerResponse(container);
    }

    async setDeliverySchedule(containerId: number, deliveryDate: string, deliveryTime: string) {
        // Use getContainerWithDetails so the carrier relation is loaded for the validation below
        const container = await this.repository.getContainerWithDetails(containerId);
        if (!container) throw new NotFoundError('Container not found');

        // Delivery schedule can only be set once a carrier is assigned
        if (!container.carrier) {
            throw new BadRequestError('Delivery schedule can only be set after a carrier is assigned');
        }

        const updated = await this.repository.setDeliverySchedule(containerId, deliveryDate, deliveryTime);
        return this.toContainerResponse(updated);
    }

    async assignCarrier(containerId: number, carrierId: number) {
        const container = await this.repository.findContainerById(containerId);
        if (!container) throw new NotFoundError('Container not found');
        if (container.status !== ContainerStatus.CONFIRMED) {
            throw new BadRequestError('Transport can only be assigned to confirmed containers');
        }

        const updated = await this.repository.assignCarrier(containerId, carrierId);
        return this.toContainerResponse(updated);
    }


    /** Fetches the container and throws if it doesn't exist or is already confirmed */
    private async fetchDraftContainerOrThrow(containerId: number): Promise<Container> {
        const container = await this.repository.findContainerById(containerId);
        if (!container) throw new NotFoundError('Container not found');
        if (container.status === ContainerStatus.CONFIRMED) {
            throw new ConflictError('Cannot modify a confirmed container');
        }
        return container;
    }

    private validateOrdersExist(requestedIds: number[], foundIds: number[]): void {
        const missingIds = requestedIds.filter((orderId) => !foundIds.includes(orderId));
        if (missingIds.length > 0) {
            throw new BadRequestError(`The following orders do not exist: ${missingIds.join(', ')}`);
        }
    }

    private validateOrdersStatus(orders: { id: number; status: number }[]): void {
        const unconfirmedOrders = orders.filter((order) => order.status !== 3);
        if (unconfirmedOrders.length > 0) {
            throw new BadRequestError(
                `Please verify that all orders are confirmed before assigning them to the container: ${unconfirmedOrders.map((order) => order.id).join(', ')}`,
            );
        }
    }

    private validateOrdersTransportType(
        orders: { id: number; transportType: TransportOptions }[],
        expected: TransportOptions,
    ): void {
        const mismatchedOrders = orders.filter((order) => order.transportType !== expected);
        if (mismatchedOrders.length > 0) {
            throw new BadRequestError(
                `The following orders have a different transport type: ${mismatchedOrders.map((order) => order.id).join(', ')}`,
            );
        }
    }

    private validateOrdersDc(orders: { id: number; dc: Dc }[], expected: string): void {
        const mismatchedOrders = orders.filter((order) => order.dc.name !== expected);
        if (mismatchedOrders.length > 0) {
            throw new BadRequestError(
                `The following orders belong to a different DC: ${mismatchedOrders.map((order) => order.id).join(', ')}`,
            );
        }
    }

    private validateOrdersInWeek(
        orders: { id: number; year: number; week: number }[],
        expectedYear: number,
        expectedWeek: number,
    ): void {
        const ordersOutsideWeek = orders.filter(
            (order) => order.year !== expectedYear || order.week !== expectedWeek,
        );
        if (ordersOutsideWeek.length > 0) {
            throw new BadRequestError(
                `The following orders do not belong to the target week: ${ordersOutsideWeek.map((order) => order.id).join(', ')}`,
            );
        }
    }

    private validateIndividualLimits(
        orders: { id: number; total_lbs: number }[],
    ): void {
        const overweightOrders = orders.filter((order) => order.total_lbs > HARD_MAX_POUNDS);
        if (overweightOrders.length > 0) {
            throw new BadRequestError(
                `The following orders individually exceed the maximum weight limit of ${HARD_MAX_POUNDS.toLocaleString()} lbs: ${overweightOrders.map((order) => order.id).join(', ')}`,
            );
        }
    }

    private validateTotalLimits(
        orders: { total_lbs: number }[],
    ): void {
        const totalPounds = orders.reduce((sum, order) => sum + order.total_lbs, 0);
        if (totalPounds > HARD_MAX_POUNDS) {
            throw new BadRequestError(
                `Total weight (${totalPounds.toLocaleString()} lbs) exceeds the maximum limit of ${HARD_MAX_POUNDS.toLocaleString()} lbs`,
            );
        }
    }

    // ─── Response formatters ─────────────────────────────────────────────────

    private toOrderResponse(order: Order, inContainerId: number | null) {
        const items = (order.products ?? []).map((orderProduct: OrderProduct) => ({
            productName: orderProduct.product?.name ?? null,
            internationalCode: orderProduct.product?.internationalCode ?? null,
            totalBoxes: orderProduct.total_boxes,
            po: order.po,
        }));

        return {
            id: order.id,
            client: order.client ? { id: order.client.id, name: order.client.name } : null,
            transportType: order.transportType,
            dc: order.dc,
            warehouse: order.dc?.warehouse ?? null,
            requiredByDate: order.requiredByDate,
            totalPallets: order.total_pallets,
            totalPounds: order.total_lbs,
            totalBoxes: order.total_boxes,
            items,
            inContainerId,
            exceedsLimits: order.total_lbs > HARD_MAX_POUNDS,
            status: order.status,
            po: order.po
        };
    }

    private toContainerResponse(container: Container) {
        const orders = container.containerOrders.map((containerOrder) =>
            this.toOrderResponse(containerOrder.order, container.id),
        );

        const dcId = container.containerOrders?.[0]?.order?.dc?.id ?? null;

        return {
            id: container.id,
            transportType: container.transportType,
            dc: container.dc,
            dcId,
            weekStart: container.weekStart,
            weekEnd: container.weekEnd,
            status: container.status,
            totalPallets: container.totalPallets,
            totalPounds: container.totalPounds,
            totalOrders: container.totalOrders,
            orders,
            createdBy: container.createdBy
                ? `${container.createdBy.name} ${container.createdBy.lastName}`
                : null,
            createdAt: container.createdAt,
            confirmedAt: container.confirmedAt,
            confirmedBy: container.confirmedBy
                ? `${container.confirmedBy.name} ${container.confirmedBy.lastName}`
                : null,
            carrier: container.carrier
                ? { id: container.carrier.id, name: container.carrier.name, shippingCost: Number(container.carrier.shippingCost) }
                : null,
            deliveryDate: container.deliveryDate ?? null,
            deliveryTime: container.deliveryTime ?? null,
        };
    }
}
