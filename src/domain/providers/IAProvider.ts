import { Client, Dc } from "../../entities/entities";

export abstract class IAProvider {
    abstract uploadFile(file: Express.Multer.File, dcs: Dc[], clients: Client[]): Promise<string>;
}