// Created by Luis

import { Carrier } from '../../entities/Carrier';
import { CarrierRate } from '../../entities/CarrierRate';
import { CreateCarrierInput, UpdateCarrierInput } from '../datasources/CarrierDatasource';

export abstract class CarrierRepository {
    abstract getAll(): Promise<Carrier[]>;
    abstract create(input: CreateCarrierInput): Promise<Carrier>;
    abstract update(id: number, input: UpdateCarrierInput): Promise<Carrier>;
    abstract delete(id: number): Promise<void>;
    abstract findById(id: number): Promise<Carrier | null>;
    abstract getRates(carrierId: number): Promise<CarrierRate[]>;
}
