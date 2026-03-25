import { UpdateResult } from "typeorm";
import { Product } from "../../entities/entities";
import { CreateOrUpdateProductPayload } from "../../interfaces/interfaces";

export abstract class ProductDatasource {
    abstract createProduct(payload: CreateOrUpdateProductPayload): Promise<Product>;
    abstract getProductByLocalCode(code: Product['localCode']): Promise<Product>;
    abstract getProductById(id: Product['id']): Promise<Product>;
    abstract getProductByInternationalCode(code: Product['internationalCode']): Promise<Product>;
    abstract getProducts(client?: number): Promise<Product[]>;
    abstract getPaginatedProducts(limit: number, offset: number): Promise<[Product[], total: number]>;
    abstract updateProductById(id: Product['id'], payload: CreateOrUpdateProductPayload): Promise<UpdateResult>;
}