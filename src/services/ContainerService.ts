// Created by Luis

import { ContainerRepository } from '../domain/repositories/ContainerRepository';
import { Container, ContainerStatus } from '../entities/Container';
import { Order, TransportOptions } from '../entities/Order';
import { Dc } from '../entities/Dc';
import { BadRequestError, ConflictError, NotFoundError } from '../infrastructure/errors/errors';
import { getCurrentWeekBounds, getWeekBounds } from '../utils/week';

// Business rule constants
const MAX_PALLETS = 20;       // standard visual reference
const MAX_POUNDS = 40000;     // standard visual reference
const HARD_MAX_POUNDS = 42000; // absolute weight ceiling — the only hard block
const MIN_POUNDS_WARNING = 20000;

export class ContainerService {
    constructor(private repository: ContainerRepository) { }

    // ─── 3.1 GET /api/containers/week ────────────────────────────────────────

    async getWeekView(dateStr: string) {
        // Parse the date at noon to avoid timezone-offset edge cases
        const date = new Date(`${dateStr}T12:00:00`);
        const { start: weekStart, end: weekEnd } = getWeekBounds(date);

        const { start: currentWeekStart, end: currentWeekEnd } = getCurrentWeekBounds();
        const isPastWeek = weekEnd < currentWeekStart;
        const isCurrentWeek = weekStart === currentWeekStart && weekEnd === currentWeekEnd;

        const { orders, containers } = await this.repository.getWeekView(weekStart, weekEnd);

        // Build a set of order IDs that are already inside a container
        const assignedOrderIds = new Set<number>();
        for (const c of containers) {
            for (const co of c.containerOrders ?? []) {
                if (co.order) assignedOrderIds.add(co.order.id);
            }
        }

        const availableOrders = orders
            .filter((o) => !assignedOrderIds.has(o.id))
            .map((o) => this.formatOrderForResponse(o, null));

        return {
            week: { start: weekStart, end: weekEnd },
            isCurrentWeek,
            isReadonly: false,
            availableOrders,
            containers: containers.map((c) => this.formatContainerForResponse(c)),
        };
    }

    // ─── 3.3 POST /api/containers ────────────────────────────────────────────

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
        this.validateOrdersExist(input.orderIds, orders.map((o) => o.id));
        this.validateOrdersStatus(orders);
        this.validateOrdersTransportType(orders, input.transportType);
        this.validateOrdersDc(orders, input.dc);
        this.validateOrdersInWeek(orders, weekStart, weekEnd);

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

    // ─── 3.4 POST /api/containers/:id/orders ─────────────────────────────────

    async addOrders(containerId: number, orderIds: number[], userId: number): Promise<Container> {
        const container = await this.requireDraftContainer(containerId);

        const orders = await this.repository.findOrdersByIds(orderIds);
        this.validateOrdersExist(orderIds, orders.map((o) => o.id));
        this.validateOrdersStatus(orders);
        this.validateOrdersTransportType(orders, container.transportType);
        this.validateOrdersDc(orders, container.dc);
        this.validateOrdersInWeek(orders, container.weekStart, container.weekEnd);

        const alreadyAssigned = await this.repository.findOrdersAlreadyInContainer(orderIds);
        if (alreadyAssigned.length > 0) {
            throw new BadRequestError(
                `The following orders are already assigned to a container: ${alreadyAssigned.join(', ')}`,
            );
        }

        // Check that adding these orders will not exceed the container limits
        const newPounds = orders.reduce((s, o) => s + o.total_lbs, 0);

        if (container.totalPounds + newPounds > HARD_MAX_POUNDS) {
            throw new BadRequestError(
                `Adding these orders would exceed the maximum weight limit (${container.totalPounds + newPounds} / ${HARD_MAX_POUNDS.toLocaleString()} lbs)`,
            );
        }

        return this.repository.addOrdersToContainer(containerId, orderIds, userId);
    }

    // ─── 3.5 DELETE /api/containers/:id/orders/:orderId ──────────────────────

    async removeOrder(containerId: number, orderId: number): Promise<Container> {
        await this.requireDraftContainer(containerId);

        const belongs = await this.repository.isOrderInContainer(containerId, orderId);
        if (!belongs) {
            throw new NotFoundError('The order does not belong to this container');
        }

        return this.repository.removeOrderFromContainer(containerId, orderId);
    }

    // ─── 3.6 POST /api/containers/:id/confirm ────────────────────────────────

    async confirmContainer(containerId: number, userId: number) {
        const container = await this.requireDraftContainer(containerId);

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

    // ─── 3.7 DELETE /api/containers/:id ──────────────────────────────────────

    async deleteContainer(containerId: number): Promise<void> {
        await this.requireDraftContainer(containerId);
        return this.repository.deleteContainer(containerId);
    }

    // ─── 3.8 GET /api/containers/:id ─────────────────────────────────────────

    async getContainerById(id: number) {
        const container = await this.repository.getContainerWithDetails(id);
        if (!container) throw new NotFoundError('Container not found');
        return this.formatContainerForResponse(container);
    }

    // ─── PATCH /api/containers/:id/delivery-schedule ─────────────────────────

    async setDeliverySchedule(containerId: number, deliveryDate: string, deliveryTime: string) {
        // Use getContainerWithDetails so the carrier relation is loaded for the validation below
        const container = await this.repository.getContainerWithDetails(containerId);
        if (!container) throw new NotFoundError('Container not found');

        // Delivery schedule can only be set once a carrier is assigned
        if (!container.carrier) {
            throw new BadRequestError('Delivery schedule can only be set after a carrier is assigned');
        }

        const updated = await this.repository.setDeliverySchedule(containerId, deliveryDate, deliveryTime);
        return this.formatContainerForResponse(updated);
    }

    // ─── 3.9 POST /api/containers/:id/assign-carrier ─────────────────────────

    async assignCarrier(containerId: number, carrierId: number) {
        const container = await this.repository.findContainerById(containerId);
        if (!container) throw new NotFoundError('Container not found');
        if (container.status !== ContainerStatus.CONFIRMED) {
            throw new BadRequestError('Transport can only be assigned to confirmed containers');
        }

        const updated = await this.repository.assignCarrier(containerId, carrierId);
        return this.formatContainerForResponse(updated);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /** Fetches the container and throws if it doesn't exist or is already confirmed */
    private async requireDraftContainer(containerId: number): Promise<Container> {
        const container = await this.repository.findContainerById(containerId);
        if (!container) throw new NotFoundError('Container not found');
        if (container.status === ContainerStatus.CONFIRMED) {
            throw new ConflictError('Cannot modify a confirmed container');
        }
        return container;
    }

    private validateOrdersExist(requested: number[], found: number[]): void {
        const missing = requested.filter((id) => !found.includes(id));
        if (missing.length > 0) {
            throw new BadRequestError(`The following orders do not exist: ${missing.join(', ')}`);
        }
    }

    private validateOrdersStatus(orders: { id: number; status: number }[]): void {
        const invalid = orders.filter((o) => o.status !== 3);
        if (invalid.length > 0) {
            throw new BadRequestError(
                `Please verify that all orders are confirmed before assigning them to the container: ${invalid.map((o) => o.id).join(', ')}`,
            );
        }
    }

    private validateOrdersTransportType(
        orders: { id: number; transportType: TransportOptions }[],
        expected: TransportOptions,
    ): void {
        const wrong = orders.filter((o) => o.transportType !== expected);
        if (wrong.length > 0) {
            throw new BadRequestError(
                `The following orders have a different transport type: ${wrong.map((o) => o.id).join(', ')}`,
            );
        }
    }

    private validateOrdersDc(orders: { id: number; dc: Dc }[], expected: string): void {
        const wrong = orders.filter((o) => o.dc.name !== expected);
        if (wrong.length > 0) {
            throw new BadRequestError(
                `The following orders belong to a different DC: ${wrong.map((o) => o.id).join(', ')}`,
            );
        }
    }

    private validateOrdersInWeek(
        orders: { id: number; requiredByDate: Date }[],
        weekStart: string,
        weekEnd: string,
    ): void {
        const start = new Date(weekStart + 'T00:00:00');
        const end = new Date(weekEnd + 'T23:59:59');
        const outOfWeek = orders.filter(
            (o) => o.requiredByDate < start || o.requiredByDate > end,
        );
        if (outOfWeek.length > 0) {
            throw new BadRequestError(
                `The following orders do not belong to the target week: ${outOfWeek.map((o) => o.id).join(', ')}`,
            );
        }
    }

    private validateIndividualLimits(
        orders: { id: number; total_lbs: number }[],
    ): void {
        const exceeding = orders.filter((o) => o.total_lbs > HARD_MAX_POUNDS);
        if (exceeding.length > 0) {
            throw new BadRequestError(
                `The following orders individually exceed the maximum weight limit of ${HARD_MAX_POUNDS.toLocaleString()} lbs: ${exceeding.map((o) => o.id).join(', ')}`,
            );
        }
    }

    private validateTotalLimits(
        orders: { total_lbs: number }[],
    ): void {
        const totalPounds = orders.reduce((s, o) => s + o.total_lbs, 0);
        if (totalPounds > HARD_MAX_POUNDS) {
            throw new BadRequestError(
                `Total weight (${totalPounds.toLocaleString()} lbs) exceeds the maximum limit of ${HARD_MAX_POUNDS.toLocaleString()} lbs`,
            );
        }
    }

    // ─── Response formatters ─────────────────────────────────────────────────

    private formatOrderForResponse(order: Order, inContainerId: number | null) {
        const items = (order.products ?? []).map((op: any) => ({
            productName: op.product?.name ?? null,
            internationalCode: op.product?.internationalCode ?? null,
            totalBoxes: op.total_boxes,
            po: op.po,
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

    private formatContainerForResponse(container: Container) {
        const orders = (container.containerOrders ?? []).map((co) =>
            this.formatOrderForResponse(co.order, container.id),
        );

        return {
            id: container.id,
            transportType: container.transportType,
            dc: container.dc,
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
