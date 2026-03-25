import { AddUserClientPayload } from '../../interfaces/interfaces';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User, UserClient } from '../../entities/entities';
import { UserClientDatasource } from '../../domain/domain';
import appDatasource from '../../config/datasource';

export class UserClientDatasourceImpl implements UserClientDatasource {
    private repo: Repository<UserClient>;

    constructor() {
        this.repo = appDatasource.getRepository(UserClient);
    }

    getUserClients(user: User): Promise<UserClient[]> {
        const options: FindOptionsWhere<UserClient> = (user.role == 'client') ? { user: { id: user.id } } : {}
        return this.repo.find({ where: options, relations: ['client'] });
    }

    addClientsToUser(payload: AddUserClientPayload[]): Promise<UserClient[]> {
        return this.repo.save(payload);
    }

}