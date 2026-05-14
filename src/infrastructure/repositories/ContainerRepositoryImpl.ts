// Created by Luis

import { ContainerRepository } from '../../domain/repositories/ContainerRepository';
import { ContainerDatasource, CreateContainerInput, WeekViewData } from '../../domain/datasources/ContainerDatasource';
import { Container } from '../../entities/Container';
import { Order } from '../../entities/Order';

export class ContainerRepositoryImpl implements ContainerRepository {
    constructor(private datasource: ContainerDatasource) {}

    getWeekView(weekStart: string, weekEnd: string): Promise<WeekViewData> {
        return this.datasource.getWeekView(weekStart, weekEnd);
    }

    getAvailableOrders(weekStart: string, weekEnd: string): Promise<Order[]> {
        return this.datasource.getAvailableOrders(weekStart, weekEnd);
    }

    findContainerById(id: number): Promise<Container | null> {
        return this.datasource.findContainerById(id);
    }

    findOrdersByIds(orderIds: number[]): Promise<Order[]> {
        return this.datasource.findOrdersByIds(orderIds);
    }

    findOrdersAlreadyInContainer(orderIds: number[]): Promise<number[]> {
        return this.datasource.findOrdersAlreadyInContainer(orderIds);
    }

    isOrderInContainer(containerId: number, orderId: number): Promise<boolean> {
        return this.datasource.isOrderInContainer(containerId, orderId);
    }

    createContainer(input: CreateContainerInput): Promise<Container> {
        return this.datasource.createContainer(input);
    }

    addOrdersToContainer(containerId: number, orderIds: number[], addedById: number): Promise<Container> {
        return this.datasource.addOrdersToContainer(containerId, orderIds, addedById);
    }

    removeOrderFromContainer(containerId: number, orderId: number): Promise<Container> {
        return this.datasource.removeOrderFromContainer(containerId, orderId);
    }

    confirmContainer(containerId: number, userId: number): Promise<Container> {
        return this.datasource.confirmContainer(containerId, userId);
    }

    deleteContainer(containerId: number): Promise<void> {
        return this.datasource.deleteContainer(containerId);
    }

    getContainerWithDetails(id: number): Promise<Container | null> {
        return this.datasource.getContainerWithDetails(id);
    }

    assignCarrier(containerId: number, carrierId: number): Promise<Container> {
        return this.datasource.assignCarrier(containerId, carrierId);
    }

    setDeliverySchedule(containerId: number, deliveryDate: string, deliveryTime: string): Promise<Container> {
        return this.datasource.setDeliverySchedule(containerId, deliveryDate, deliveryTime);
    }
}
