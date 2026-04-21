import { FindManyOptions } from "typeorm";
import { Dc } from "../../entities/entities";
import { CreateOrUpdateDc } from "../../interfaces/interfaces";

export abstract class DcDatasource {
    abstract createDc(payload: CreateOrUpdateDc): Promise<Dc>;
    abstract getDcs(options: FindManyOptions<Dc>): Promise<Dc[]>;
    abstract getDcById(id: Dc['id']): Promise<Dc>;
}