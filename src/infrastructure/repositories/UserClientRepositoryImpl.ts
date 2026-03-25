import { UserClientDatasource, UserClientRepository } from '../../domain/domain';
import { User, UserClient } from '../../entities/entities';
import { AddUserClientPayload } from '../../interfaces/interfaces';

export class UserClientRepositoryImpl implements UserClientRepository {
    constructor(private datasource: UserClientDatasource) { }

    getUserClients(user: User): Promise<UserClient[]> {
        return this.datasource.getUserClients(user);
    }

    addClientsToUser(payload: AddUserClientPayload[]): Promise<UserClient[]> {
        return this.datasource.addClientsToUser(payload);
    }

}