import { CreateOrUpdateProductPayload, ProductFilters } from '../../interfaces/interfaces';
import { Product } from '../../entities/entities';
import { ProductDatasource, ProductRepository } from '../../domain/domain';
import { FindManyOptions, UpdateResult } from 'typeorm';

export class ProductRepositoryImpl implements ProductRepository {
    constructor(private datasource: ProductDatasource) { }

    getPaginatedProducts(options: FindManyOptions<Product>): Promise<[Product[], total: number]> {
        return this.datasource.getPaginatedProducts(options);
    }

    getProductById(id: Product['id']): Promise<Product> {
        return this.datasource.getProductById(id);
    }
    updateProductById(id: Product['id'], payload: CreateOrUpdateProductPayload): Promise<UpdateResult> {
        return this.datasource.updateProductById(id, payload);
    }

    getProducts(options: FindManyOptions<Product>): Promise<Product[]> {
        return this.datasource.getProducts(options);
    }

    getProductByLocalCode(code: Product['localCode']): Promise<Product> {
        return this.datasource.getProductByLocalCode(code);
    }
    getProductByInternationalCode(code: Product['internationalCode']): Promise<Product> {
        return this.datasource.getProductByInternationalCode(code);
    }

    createProduct(payload: CreateOrUpdateProductPayload): Promise<Product> {
        return this.datasource.createProduct(payload);
    }

}