import { ClientDatasource } from '../../domain/datasources/ClientDatasource';
import { Repository, UpdateResult } from 'typeorm';
import { UserClient, Client } from '../../entities/entities';
import appDatasource from '../../config/datasource';

export class ClientDatasourceImpl implements ClientDatasource {
    private repo: Repository<Client>;

    constructor() {
        this.repo = appDatasource.getRepository(Client);
    }

    createClient(name: string): Promise<Client> {
        return this.repo.save({ name });
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