import { UpdateResult } from "typeorm";
import { User } from "../../entities/entities";
import { CreateOrUpdateUserPayload } from "../../interfaces/interfaces";

export abstract class AuthDatasource {
    abstract getUserByEmail(email: string): Promise<User>;
    abstract getUserById(id: User['id']): Promise<User>;
    abstract getUsers(): Promise<User[]>;
    abstract createUser(payload: CreateOrUpdateUserPayload): Promise<User>;
    abstract updateUserById(user: User, payload: CreateOrUpdateUserPayload): Promise<UpdateResult>;
}