import { FindManyOptions, UpdateResult } from "typeorm";
import { Product } from "../../entities/entities";
import { CreateOrUpdateProductPayload, ProductFilters } from "../../interfaces/interfaces";

export abstract class ProductDatasource {
    abstract createProduct(payload: CreateOrUpdateProductPayload): Promise<Product>;
    abstract getProductByLocalCode(code: Product['localCode']): Promise<Product>;
    abstract getProductById(id: Product['id']): Promise<Product>;
    abstract getProductByInternationalCode(code: Product['internationalCode']): Promise<Product>;
    abstract getProducts(options: FindManyOptions<Product>): Promise<Product[]>;
    abstract getPaginatedProducts(options: FindManyOptions<Product>): Promise<[Product[], total: number]>;
    abstract updateProductById(id: Product['id'], payload: CreateOrUpdateProductPayload): Promise<UpdateResult>;
}