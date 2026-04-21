import { FindManyOptions, Repository } from 'typeorm';
import { DcDatasource } from '../../domain/datasources/DcDatasource';
import { Dc } from '../../entities/Dc';
import { CreateOrUpdateDc } from '../../interfaces/interfaces';
import appDatasource from '../../config/datasource';

export class DcDatasourceImpl implements DcDatasource {
    private repo: Repository<Dc>;

    constructor() {
        this.repo = appDatasource.getRepository(Dc);
    }
    getDcById(id: Dc['id']): Promise<Dc> {
        return this.repo.findOneBy({ id });
    }

    getDcs(options: FindManyOptions<Dc>): Promise<Dc[]> {
        return this.repo.find(options);
    }

    createDc(payload: CreateOrUpdateDc): Promise<Dc> {
        const { client_id, ...data } = payload;
        return this.repo.save(data);
    }

}