import { CarrierRepository } from '../domain/repositories/CarrierRepository';
import { Carrier } from '../entities/Carrier';
import { CarrierRate } from '../entities/CarrierRate';
import { BadRequestError, NotFoundError } from '../infrastructure/errors/errors';

export class CarrierService {
    constructor(private repository: CarrierRepository) {}

    async getAll() {
        const carriers = await this.repository.getAll();
        return carriers.map((carrier) => this.toCarrierResponse(carrier));
    }

    async getByDcId(dcId: number) {
        const carriers = await this.repository.getByDcId(dcId);
        return carriers.map((carrier) => this.toCarrierResponse(carrier));
    }

    async create(input: { name: string; shippingCost: number; rateUpdatedAt: string; dcId?: number | null }) {
        this.validateFields(input.name, input.shippingCost, input.rateUpdatedAt);
        const carrier = await this.repository.create(input);
        return this.toCarrierResponse(carrier);
    }

    async update(id: number, input: { name?: string; shippingCost?: number; rateUpdatedAt?: string; dcId?: number | null }) {
        const carrier = await this.repository.findById(id);
        if (!carrier) throw new NotFoundError('Carrier not found');

        if (input.name !== undefined && input.name.trim() === '') {
            throw new BadRequestError('Name cannot be empty');
        }
        if (input.shippingCost !== undefined && (isNaN(input.shippingCost) || input.shippingCost < 0)) {
            throw new BadRequestError('Shipping cost must be a non-negative number');
        }

        const updatedCarrier = await this.repository.update(id, {
            name: input.name,
            shippingCost: input.shippingCost,
            rateUpdatedAt: input.rateUpdatedAt,
            ...('dcId' in input && { dcId: input.dcId }),
        });
        return this.toCarrierResponse(updatedCarrier);
    }

    async delete(id: number) {
        const carrier = await this.repository.findById(id);
        if (!carrier) throw new NotFoundError('Carrier not found');
        await this.repository.delete(id);
    }

    async getRates(carrierId: number) {
        const carrier = await this.repository.findById(carrierId);
        if (!carrier) throw new NotFoundError('Carrier not found');
        const rates = await this.repository.getRates(carrierId);
        return rates.map((carrierRate: CarrierRate) => ({
            id: carrierRate.id,
            cost: Number(carrierRate.cost),
            effectiveDate: carrierRate.effectiveDate,
            createdAt: carrierRate.createdAt,
        }));
    }

    private validateFields(name: string, shippingCost: number, rateUpdatedAt: string) {
        if (!name || name.trim() === '') throw new BadRequestError('Name is required');
        if (isNaN(shippingCost) || shippingCost < 0) throw new BadRequestError('Shipping cost must be a non-negative number');
        if (!rateUpdatedAt) throw new BadRequestError('Rate updated date is required');
    }

    private toCarrierResponse(carrier: Carrier) {
        return {
            id: carrier.id,
            name: carrier.name,
            shippingCost: Number(carrier.shippingCost),
            rateUpdatedAt: carrier.rateUpdatedAt,
            dc: carrier.dc ? { id: carrier.dc.id, name: carrier.dc.name, code: carrier.dc.code } : null,
            clientName: carrier.dc?.client?.name ?? null,
            createdAt: carrier.createdAt,
            updatedAt: carrier.updatedAt,
        };
    }
}
