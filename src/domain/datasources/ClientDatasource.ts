import { UpdateResult } from "typeorm";
import { Client, User, UserClient } from "../../entities/entities";

export abstract class ClientDatasource {
    abstract createClient(name: string): Promise<Client>;
    abstract getClients(): Promise<Client[]>;
    abstract getClientById(id: Client['id']): Promise<Client>;
    abstract updateClientById(id: Client['id'], name: string): Promise<UpdateResult>;
}