import { UpdateResult } from 'typeorm';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { Client } from '../../entities/entities';
import { ClientDatasource } from '../../domain/datasources/ClientDatasource';

export class ClientRepositoryImpl implements ClientRepository {
    constructor(private datasource: ClientDatasource) { }


    createClient(name: string, code: string): Promise<Client> {
        return this.datasource.createClient(name, code);
    }
    getClients(): Promise<Client[]> {
        return this.datasource.getClients();
    }

    getClientById(id: Client['id']): Promise<Client> {
        return this.datasource.getClientById(id);
    }

    updateClientById(id: Client['id'], name: string): Promise<UpdateResult> {
        return this.datasource.updateClientById(id, name);
    }

}