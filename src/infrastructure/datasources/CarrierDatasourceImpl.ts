// Created by Luis

import { Repository } from 'typeorm';
import appDatasource from '../../config/datasource';
import { CarrierDatasource, CreateCarrierInput, UpdateCarrierInput } from '../../domain/datasources/CarrierDatasource';
import { Carrier } from '../../entities/Carrier';

export class CarrierDatasourceImpl implements CarrierDatasource {
    private repo: Repository<Carrier>;

    constructor() {
        this.repo = appDatasource.getRepository(Carrier);
    }

    async getAll(): Promise<Carrier[]> {
        return this.repo.find({ order: { name: 'ASC' } });
    }

    async findById(id: number): Promise<Carrier | null> {
        return this.repo.findOneBy({ id });
    }

    async create(input: CreateCarrierInput): Promise<Carrier> {
        const carrier = this.repo.create(input);
        return this.repo.save(carrier);
    }

    async update(id: number, input: UpdateCarrierInput): Promise<Carrier> {
        await this.repo.update({ id }, input);
        return this.repo.findOneBy({ id });
    }

    async delete(id: number): Promise<void> {
        await this.repo.delete({ id });
    }
}
