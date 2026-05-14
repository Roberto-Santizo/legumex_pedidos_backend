// Created by Luis

import { Container } from '../../entities/Container';
import { Order } from '../../entities/Order';
import { CreateContainerInput, WeekViewData } from '../datasources/ContainerDatasource';

// The Repository interface mirrors the Datasource — it acts as the boundary
// between the service layer and the infrastructure layer.
export abstract class ContainerRepository {
    abstract getWeekView(weekStart: string, weekEnd: string): Promise<WeekViewData>;
    abstract getAvailableOrders(weekStart: string, weekEnd: string): Promise<Order[]>;
    abstract findContainerById(id: number): Promise<Container | null>;
    abstract findOrdersByIds(orderIds: number[]): Promise<Order[]>;
    abstract findOrdersAlreadyInContainer(orderIds: number[]): Promise<number[]>;
    abstract isOrderInContainer(containerId: number, orderId: number): Promise<boolean>;
    abstract createContainer(input: CreateContainerInput): Promise<Container>;
    abstract addOrdersToContainer(containerId: number, orderIds: number[], addedById: number): Promise<Container>;
    abstract removeOrderFromContainer(containerId: number, orderId: number): Promise<Container>;
    abstract confirmContainer(containerId: number, userId: number): Promise<Container>;
    abstract deleteContainer(containerId: number): Promise<void>;
    abstract getContainerWithDetails(id: number): Promise<Container | null>;
    abstract assignCarrier(containerId: number, carrierId: number): Promise<Container>;
    abstract setDeliverySchedule(containerId: number, deliveryDate: string, deliveryTime: string): Promise<Container>;
}
