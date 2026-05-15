
import { Carrier } from '../../entities/Carrier';
import { CarrierRate } from '../../entities/CarrierRate';

export interface CreateCarrierInput {
    name: string;
    shippingCost: number;
    rateUpdatedAt: string;
    dcId?: number | null;
}

export interface UpdateCarrierInput {
    name?: string;
    shippingCost?: number;
    rateUpdatedAt?: string;
    dcId?: number | null;
}

export abstract class CarrierDatasource {
    abstract getAll(): Promise<Carrier[]>;
    abstract getByDcId(dcId: number): Promise<Carrier[]>;
    abstract create(input: CreateCarrierInput): Promise<Carrier>;
    abstract update(id: number, input: UpdateCarrierInput): Promise<Carrier>;
    abstract delete(id: number): Promise<void>;
    abstract findById(id: number): Promise<Carrier | null>;
    abstract getRates(carrierId: number): Promise<CarrierRate[]>;
}
