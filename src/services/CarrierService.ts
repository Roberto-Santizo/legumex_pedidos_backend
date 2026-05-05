// Created by Luis

import { CarrierRepository } from '../domain/repositories/CarrierRepository';
import { BadRequestError, NotFoundError } from '../infrastructure/errors/errors';

export class CarrierService {
    constructor(private repository: CarrierRepository) {}

    async getAll() {
        const carriers = await this.repository.getAll();
        return carriers.map((c) => this.format(c));
    }

    async create(input: { name: string; shippingCost: number; rateUpdatedAt: string; dcId?: number | null }) {
        this.validateFields(input.name, input.shippingCost, input.rateUpdatedAt);
        const carrier = await this.repository.create(input);
        return this.format(carrier);
    }

    async update(id: number, input: { name?: string; shippingCost?: number; rateUpdatedAt?: string; dcId?: number | null }) {
        const existing = await this.repository.findById(id);
        if (!existing) throw new NotFoundError('Carrier not found');

        if (input.name !== undefined && input.name.trim() === '') {
            throw new BadRequestError('Name cannot be empty');
        }
        if (input.shippingCost !== undefined && (isNaN(input.shippingCost) || input.shippingCost < 0)) {
            throw new BadRequestError('Shipping cost must be a non-negative number');
        }

        const updated = await this.repository.update(id, {
            name: input.name,
            shippingCost: input.shippingCost,
            rateUpdatedAt: input.rateUpdatedAt,
            ...('dcId' in input && { dcId: input.dcId }),
        });
        return this.format(updated);
    }

    async delete(id: number) {
        const existing = await this.repository.findById(id);
        if (!existing) throw new NotFoundError('Carrier not found');
        await this.repository.delete(id);
    }

    async getRates(carrierId: number) {
        const existing = await this.repository.findById(carrierId);
        if (!existing) throw new NotFoundError('Carrier not found');
        const rates = await this.repository.getRates(carrierId);
        return rates.map((r) => ({
            id: r.id,
            cost: Number(r.cost),
            effectiveDate: r.effectiveDate,
            createdAt: r.createdAt,
        }));
    }

    private validateFields(name: string, shippingCost: number, rateUpdatedAt: string) {
        if (!name || name.trim() === '') throw new BadRequestError('Name is required');
        if (isNaN(shippingCost) || shippingCost < 0) throw new BadRequestError('Shipping cost must be a non-negative number');
        if (!rateUpdatedAt) throw new BadRequestError('Rate updated date is required');
    }

    private format(c: any) {
        return {
            id: c.id,
            name: c.name,
            shippingCost: Number(c.shippingCost),
            rateUpdatedAt: c.rateUpdatedAt,
            dc: c.dc ? { id: c.dc.id, name: c.dc.name, code: c.dc.code } : null,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        };
    }
}
