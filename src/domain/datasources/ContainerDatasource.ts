// Created by Luis

import { Container } from '../../entities/Container';
import { Order } from '../../entities/Order';
import { TransportOptions } from '../../entities/Order';

// --- Input / output shapes ---

export interface CreateContainerInput {
    transportType: TransportOptions;
    dc: string;
    weekStart: string;
    weekEnd: string;
    createdById: number;
    orderIds: number[];
}

export interface WeekViewData {
    /** All status=3 orders whose requiredByDate falls within the week, with client + products loaded */
    orders: Order[];
    /** All containers for that week, with their containerOrders + nested order details loaded */
    containers: Container[];
}

// --- Abstract datasource ---

export abstract class ContainerDatasource {
    /** Returns orders + containers for a given ISO week (weekStart = Monday, weekEnd = Sunday) */
    abstract getWeekView(weekStart: string, weekEnd: string): Promise<WeekViewData>;

    /** Returns status=3 orders in the week that are NOT assigned to any container */
    abstract getAvailableOrders(weekStart: string, weekEnd: string): Promise<Order[]>;

    /** Finds a container by ID (no nested relations — used for status/capacity checks) */
    abstract findContainerById(id: number): Promise<Container | null>;

    /** Returns the Order entities for the given IDs */
    abstract findOrdersByIds(orderIds: number[]): Promise<Order[]>;

    /**
     * Returns the subset of orderIds that are already assigned to any container.
     * Used to prevent double-assigning an order.
     */
    abstract findOrdersAlreadyInContainer(orderIds: number[]): Promise<number[]>;

    /** Returns true if the given order belongs to the given container */
    abstract isOrderInContainer(containerId: number, orderId: number): Promise<boolean>;

    /** Creates a new DRAFT container with its orders inside a single transaction */
    abstract createContainer(input: CreateContainerInput): Promise<Container>;

    /** Adds orders to an existing DRAFT container and recalculates totals */
    abstract addOrdersToContainer(containerId: number, orderIds: number[], addedById: number): Promise<Container>;

    /** Removes one order from a DRAFT container and recalculates totals */
    abstract removeOrderFromContainer(containerId: number, orderId: number): Promise<Container>;

    /** Sets the container status to CONFIRMED */
    abstract confirmContainer(containerId: number, userId: number): Promise<Container>;

    /** Deletes a DRAFT container (CASCADE removes its ContainerOrder rows) */
    abstract deleteContainer(containerId: number): Promise<void>;

    /** Returns a container with all nested relations loaded (for the detail endpoint) */
    abstract getContainerWithDetails(id: number): Promise<Container | null>;

    /** Assigns a carrier to a confirmed container and returns the updated container with details */
    abstract assignCarrier(containerId: number, carrierId: number): Promise<Container>;
}
