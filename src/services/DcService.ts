import { FindManyOptions } from "typeorm";
import { DcRepository } from "../domain/repositories/DcRepository";
import { Client, Dc } from "../entities/entities";
import { CreateOrUpdateDc } from "../interfaces/interfaces";
import { clientProvider } from "../providers/clientRepositoryProvider";

export class DcService {
    constructor(private repository: DcRepository) { }

    async createDc(payload: CreateOrUpdateDc) {
        const client = await clientProvider.getClientById(payload.client_id);
        payload.client = client;

        return this.repository.createDc(payload);
    }

    async getDcs(client_id?: Client['id']) {
        let options: FindManyOptions<Dc> = { relations: ['client'] }

        if (client_id) {
            options = { ...options, where: { ...options.where, client: { id: client_id } } }
        }

        return this.repository.getDcs(options);
    }

    async getDcById(id: Dc['id']) {
        const dc = await this.repository.getDcById(id);
        return dc;
    }
}