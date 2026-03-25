import { AuthDatasource } from '../../domain/domain';
import { CreateOrUpdateUserPayload } from '../../interfaces/interfaces';
import { Repository, UpdateResult } from 'typeorm';
import { User } from '../../entities/entities';
import appDatasource from '../../config/datasource';

export class AuthDatasourceImpl implements AuthDatasource {
    private repo: Repository<User>;

    constructor() {
        this.repo = appDatasource.getRepository(User);
    }

    getUsers(): Promise<User[]> {
        return this.repo.find();
    }

    updateUserById(user: User, payload: CreateOrUpdateUserPayload): Promise<UpdateResult> {
        const { clients, ...data } = payload;
        return this.repo.update({ id: user.id }, data);
    }

    createUser(payload: CreateOrUpdateUserPayload): Promise<User> {
        const { clients, ...data } = payload;
        return this.repo.save(data);
    }

    getUserById(id: User['id']): Promise<User> {
        return this.repo.findOneBy({ id });
    }

    getUserByEmail(email: string): Promise<User> {
        return this.repo.findOneBy({ email });
    }

}