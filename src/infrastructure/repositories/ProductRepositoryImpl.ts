import { CreateOrUpdateProductPayload } from '../../interfaces/interfaces';
import { Product } from '../../entities/entities';
import { ProductDatasource, ProductRepository } from '../../domain/domain';
import { UpdateResult } from 'typeorm';

export class ProductRepositoryImpl implements ProductRepository {
    constructor(private datasource: ProductDatasource) { }

    getPaginatedProducts(limit: number, offset: number): Promise<[Product[], total: number]> {
        return this.datasource.getPaginatedProducts(limit, offset);
    }

    getProductById(id: Product['id']): Promise<Product> {
        return this.datasource.getProductById(id);
    }
    updateProductById(id: Product['id'], payload: CreateOrUpdateProductPayload): Promise<UpdateResult> {
        return this.datasource.updateProductById(id, payload);
    }

    getProducts(client?: number): Promise<Product[]> {
        return this.datasource.getProducts(client);
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