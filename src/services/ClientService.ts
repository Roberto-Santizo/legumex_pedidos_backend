import { ClientRepository } from "../domain/repositories/ClientRepository";
import { Client } from "../entities/entities";
import { NotFoundError } from "../infrastructure/infrastructure";

export class ClientService {
    constructor(private repository: ClientRepository) { }

    async createClient(name: string) {
        return this.repository.createClient(name);
    }

    async getClients() {
        return this.repository.getClients();
    }

    async getClientById(id: Client['id']) {
        const client = await this.repository.getClientById(id);

        if (!client) throw new NotFoundError("El cliente no existe");

        return client;
    }

    async updateClientById(id: Client['id'], name: string) {
        const client = await this.repository.getClientById(id);

        if (!client) throw new NotFoundError("El cliente no existe");

        return this.repository.updateClientById(client.id, name);
    }
}