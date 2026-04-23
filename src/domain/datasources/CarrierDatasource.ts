// Created by Luis

import { Carrier } from '../../entities/Carrier';

export interface CreateCarrierInput {
    name: string;
    shippingCost: number;
    rateUpdatedAt: string;
}

export interface UpdateCarrierInput {
    name?: string;
    shippingCost?: number;
    rateUpdatedAt?: string;
}

export abstract class CarrierDatasource {
    abstract getAll(): Promise<Carrier[]>;
    abstract create(input: CreateCarrierInput): Promise<Carrier>;
    abstract update(id: number, input: UpdateCarrierInput): Promise<Carrier>;
    abstract delete(id: number): Promise<void>;
    abstract findById(id: number): Promise<Carrier | null>;
}
