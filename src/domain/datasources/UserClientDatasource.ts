import { User, UserClient } from "../../entities/entities";
import { AddUserClientPayload } from "../../interfaces/interfaces";

export abstract class UserClientDatasource {
    abstract addClientsToUser(payload: AddUserClientPayload[]): Promise<UserClient[]>;
    abstract getUserClients(user: User): Promise<UserClient[]>;
}