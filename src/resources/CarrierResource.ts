// Created by Luis

import { Carrier } from '../entities/Carrier';
import { CarrierRate } from '../entities/CarrierRate';

export class CarrierResource {
    static json(carrier: Carrier) {
        return {
            id: carrier.id,
            name: carrier.name,
            shippingCost: Number(carrier.shippingCost),
            rateUpdatedAt: carrier.rateUpdatedAt,
            dcId: carrier.dc?.id ?? null,
            dcName: carrier.dc?.name ?? null,
            clientName: carrier.dc?.client?.name ?? null,
            createdAt: carrier.createdAt,
            updatedAt: carrier.updatedAt,
        };
    }

    static collection(carriers: Carrier[]) {
        return carriers.map((carrier) => this.json(carrier));
    }

    static rate(rate: CarrierRate) {
        return {
            id: rate.id,
            cost: Number(rate.cost),
            effectiveDate: rate.effectiveDate,
            createdAt: rate.createdAt,
        };
    }

    static rateCollection(rates: CarrierRate[]) {
        return rates.map((rate) => this.rate(rate));
    }
}
