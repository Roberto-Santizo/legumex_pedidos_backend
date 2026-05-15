// Created by Luis

import { Carrier } from '../../entities/Carrier';
import { CarrierRate } from '../../entities/CarrierRate';
import { CarrierDatasource, CreateCarrierInput, UpdateCarrierInput } from '../../domain/datasources/CarrierDatasource';
import { CarrierRepository } from '../../domain/repositories/CarrierRepository';

export class CarrierRepositoryImpl implements CarrierRepository {
    constructor(private datasource: CarrierDatasource) {}

    getAll(): Promise<Carrier[]> { return this.datasource.getAll(); }
    getByDcId(dcId: number): Promise<Carrier[]> { return this.datasource.getByDcId(dcId); }
    findById(id: number): Promise<Carrier | null> { return this.datasource.findById(id); }
    create(input: CreateCarrierInput): Promise<Carrier> { return this.datasource.create(input); }
    update(id: number, input: UpdateCarrierInput): Promise<Carrier> { return this.datasource.update(id, input); }
    delete(id: number): Promise<void> { return this.datasource.delete(id); }
    getRates(carrierId: number): Promise<CarrierRate[]> { return this.datasource.getRates(carrierId); }
}
