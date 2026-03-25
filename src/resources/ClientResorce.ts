import { UserClient } from "../entities/UserClient";

export class ClientResource {
    static json(userClient: UserClient) {
        return {
            id: userClient.client.id,
            name: userClient.client.name
        }
    }

    static collection(userClients: UserClient[]) {
        return userClients.map(client => this.json(client));
    }
}