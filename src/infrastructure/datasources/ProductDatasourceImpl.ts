import { FindManyOptions, FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { ProductDatasource } from '../../domain/domain';
import { Product } from '../../entities/entities';
import { CreateOrUpdateProductPayload } from '../../interfaces/interfaces';
import appDatasource from '../../config/datasource';

export class ProductDatasourceImpl implements ProductDatasource {
    private repo: Repository<Product>;

    constructor() {
        this.repo = appDatasource.getRepository(Product);
    }

    async getPaginatedProducts(options: FindManyOptions<Product>): Promise<[Product[], total: number]> {
        const [data, total] = await this.repo.findAndCount(options);
        return [data, total];
    }

    getProductById(id: Product['id']): Promise<Product> {
        return this.repo.findOne({ where: { id }, relations: ['client', 'prices'] })
    }

    updateProductById(id: Product['id'], payload: CreateOrUpdateProductPayload): Promise<UpdateResult> {
        const { client_id, ...data } = payload;
        return this.repo.update({ id }, data);
    }

    getProducts(options: FindManyOptions<Product>): Promise<Product[]> {
        return this.repo.find(options);
    }

    getProductByLocalCode(code: Product['localCode']): Promise<Product> {
        return this.repo.findOneBy({ localCode: code });
    }
    getProductByInternationalCode(code: Product['internationalCode']): Promise<Product> {
        return this.repo.findOneBy({ internationalCode: code });
    }

    createProduct(payload: CreateOrUpdateProductPayload): Promise<Product> {
        const { client_id, ...data } = payload;
        return this.repo.save(data);
    }

}