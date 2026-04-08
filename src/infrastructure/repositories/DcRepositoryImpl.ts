import { FindManyOptions } from 'typeorm';
import { DcDatasource } from '../../domain/datasources/DcDatasource';
import { DcRepository } from '../../domain/repositories/DcRepository';
import { Dc } from '../../entities/Dc';
import { CreateOrUpdateDc } from '../../interfaces/interfaces';

export class DcRepositoryImpl implements DcRepository {
    constructor(private datasource: DcDatasource) { }

    getDcs(options: FindManyOptions<Dc>): Promise<Dc[]> {
        return this.datasource.getDcs(options);
    }

    createDc(payload: CreateOrUpdateDc): Promise<Dc> {
        return this.datasource.createDc(payload);
    }

}