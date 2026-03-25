import { UpdateResult } from 'typeorm';
import { AuthDatasource, AuthRepository } from '../../domain/domain';
import { User } from '../../entities/entities';
import { CreateOrUpdateUserPayload } from '../../interfaces/interfaces';

export class AuthRepositoryImpl implements AuthRepository {
    constructor(private datasource: AuthDatasource) { }

    getUsers(): Promise<User[]> {
        return this.datasource.getUsers();
    }

    updateUserById(user: User, payload: CreateOrUpdateUserPayload): Promise<UpdateResult> {
        return this.datasource.updateUserById(user, payload);
    }

    createUser(payload: CreateOrUpdateUserPayload): Promise<User> {
        return this.datasource.createUser(payload);
    }

    getUserById(id: User['id']): Promise<User> {
        return this.datasource.getUserById(id);
    }

    getUserByEmail(email: string): Promise<User> {
        return this.datasource.getUserByEmail(email);
    }

}