// Created by Luis

import { Repository } from 'typeorm';
import appDatasource from '../../config/datasource';
import { CarrierDatasource, CreateCarrierInput, UpdateCarrierInput } from '../../domain/datasources/CarrierDatasource';
import { Carrier } from '../../entities/Carrier';
import { CarrierRate } from '../../entities/CarrierRate';

export class CarrierDatasourceImpl implements CarrierDatasource {
    private repo: Repository<Carrier>;
    private rateRepo: Repository<CarrierRate>;

    constructor() {
        this.repo = appDatasource.getRepository(Carrier);
        this.rateRepo = appDatasource.getRepository(CarrierRate);
    }

    async getAll(): Promise<Carrier[]> {
        return this.repo.find({ relations: ['dc', 'dc.client'], order: { id: 'DESC' } });
    }

    async getByDcId(dcId: number): Promise<Carrier[]> {
        return this.repo.find({ where: { dc: { id: dcId } }, relations: ['dc', 'dc.client'], order: { id: 'DESC' } });
    }

    async findById(id: number): Promise<Carrier | null> {
        return this.repo.findOne({ where: { id }, relations: ['dc', 'dc.client'] });
    }

    async create(input: CreateCarrierInput): Promise<Carrier> {
        const carrier = this.repo.create({
            name: input.name,
            shippingCost: input.shippingCost,
            rateUpdatedAt: input.rateUpdatedAt,
        });
        const saved = await this.repo.save(carrier);

        if (input.dcId != null) {
            await appDatasource.createQueryBuilder()
                .relation(Carrier, 'dc')
                .of(saved.id)
                .set(input.dcId);
        }

        // Record the initial rate in history
        await this.rateRepo.save(
            this.rateRepo.create({
                carrier: { id: saved.id } as Carrier,
                cost: input.shippingCost,
                effectiveDate: input.rateUpdatedAt,
            }),
        );

        return this.repo.findOne({ where: { id: saved.id }, relations: ['dc', 'dc.client'] });
    }

    async update(id: number, input: UpdateCarrierInput): Promise<Carrier> {
        const scalarUpdates: Partial<Pick<Carrier, 'name' | 'shippingCost' | 'rateUpdatedAt'>> = {};
        if (input.name !== undefined) scalarUpdates.name = input.name;
        if (input.shippingCost !== undefined) scalarUpdates.shippingCost = input.shippingCost;
        if (input.rateUpdatedAt !== undefined) scalarUpdates.rateUpdatedAt = input.rateUpdatedAt;

        if (Object.keys(scalarUpdates).length > 0) {
            await this.repo.update({ id }, scalarUpdates);
        }

        if ('dcId' in input) {
            await appDatasource.createQueryBuilder()
                .relation(Carrier, 'dc')
                .of(id)
                .set(input.dcId ?? null);
        }

        // Record a new rate entry whenever shippingCost or rateUpdatedAt changes
        if (input.shippingCost !== undefined || input.rateUpdatedAt !== undefined) {
            const current = await this.repo.findOneBy({ id });
            await this.rateRepo.save(
                this.rateRepo.create({
                    carrier: { id } as Carrier,
                    cost: Number(current.shippingCost),
                    effectiveDate: current.rateUpdatedAt,
                }),
            );
        }

        return this.repo.findOne({ where: { id }, relations: ['dc', 'dc.client'] });
    }

    async delete(id: number): Promise<void> {
        await this.repo.delete({ id });
    }

    async getRates(carrierId: number): Promise<CarrierRate[]> {
        return this.rateRepo.find({
            where: { carrier: { id: carrierId } },
            order: { effectiveDate: 'DESC', createdAt: 'DESC' },
        });
    }
}
