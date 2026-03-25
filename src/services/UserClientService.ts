import { UserClientRepository } from "../domain/domain";
import { User } from "../entities/entities";
import { AddUserClientPayload } from "../interfaces/interfaces";

export class UserClientService {
    constructor(private service: UserClientRepository) { }

    async addClientsToUser(payload: AddUserClientPayload[]) {
        return this.service.addClientsToUser(payload);
    }

    async getUserClients(user: User) {
        return this.service.getUserClients(user);
    }
}