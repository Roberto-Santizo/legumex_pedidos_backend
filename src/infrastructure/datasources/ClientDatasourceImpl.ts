import { ClientDatasource } from '../../domain/datasources/ClientDatasource';
import { Repository, UpdateResult } from 'typeorm';
import { Client } from '../../entities/entities';
import appDatasource from '../../config/datasource';

export class ClientDatasourceImpl implements ClientDatasource {
    private repo: Repository<Client>;

    constructor() {
        this.repo = appDatasource.getRepository(Client);
    }

    createClient(name: string, code: string): Promise<Client> {
        return this.repo.save({ name, code });
    }
    getClients(): Promise<Client[]> {
        return this.repo.find({ order: { id: 'ASC' } });
    }
    getClientById(id: Client['id']): Promise<Client> {
        return this.repo.findOneBy({ id: id });
    }
    updateClientById(id: Client['id'], name: string): Promise<UpdateResult> {
        return this.repo.update({ id }, { name });
    }

}