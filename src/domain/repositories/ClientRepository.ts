import { UpdateResult } from "typeorm";
import { Client } from "../../entities/entities";

export abstract class ClientRepository {
    abstract createClient(name: string, code: string): Promise<Client>;
    abstract getClients(): Promise<Client[]>;
    abstract getClientById(id: Client['id']): Promise<Client>;
    abstract updateClientById(id: Client['id'], name: string): Promise<UpdateResult>;
}