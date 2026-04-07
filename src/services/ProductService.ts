import { clientProvider } from "../providers/clientRepositoryProvider";
import { ConflictError, NotFoundError } from "../infrastructure/infrastructure";
import { CreateOrUpdateProductPayload, ProductFilters } from "../interfaces/interfaces";
import { FindManyOptions, Like } from "typeorm";
import { getCurrentDate } from "../utils/date";
import { Product } from "../entities/entities";
import { productPriceBinnacleRepository } from "../providers/productPriceBinnacleRepositoryProvider";
import { ProductRepository } from "../domain/domain";
import { TransportOptions } from "../entities/Order";

export class ProductService {
    constructor(private repository: ProductRepository) { }

    async _validateCodes(localCode: Product['localCode'], intCode: Product['internationalCode'], id?: Product['id']) {
        const productByLocalCode = await this.getProductByLocalCode(localCode);
        const productByInternationalCode = await this.getProductByInternationalCode(intCode);

        if (id) {
            if (productByLocalCode && productByLocalCode.id != id) {
                throw new ConflictError("El código local ya existe");
            }
            if (productByInternationalCode && productByInternationalCode.id != id) {
                throw new ConflictError("El código internacional ya existe");
            }
        } else {
            if (productByInternationalCode) throw new ConflictError("El código internacional ya existe");
            if (productByLocalCode) throw new ConflictError("El código local ya existe");
        }
    }

    async getProductByLocalCode(code: Product['localCode']) {
        const product = this.repository.getProductByLocalCode(code);
        return product;
    }

    async getProductByInternationalCode(code: Product['localCode']) {
        const product = this.repository.getProductByInternationalCode(code);
        return product;
    }

    async createProduct(payload: CreateOrUpdateProductPayload) {
        // await this._validateCodes(payload.localCode, payload.internationalCode);
        const client = await clientProvider.getClientById(payload.client_id);
        payload.client = client;

        return this.repository.createProduct(payload);
    }

    async getProductById(id: Product['id']) {
        const product = await this.repository.getProductById(id);
        if (!product) throw new NotFoundError("El producto no existe");

        return product;
    }

    async updateProductById(id: Product['id'], payload: CreateOrUpdateProductPayload) {
        const product = await this.getProductById(id);
        // await this._validateCodes(payload.localCode, payload.internationalCode, id);
        const client = await clientProvider.getClientById(payload.client_id);
        payload.client = client;

        if (product.price != payload.price) {
            await productPriceBinnacleRepository.updateProductPrice({ last_price: product.price, new_price: payload.price, product: product, createdAt: getCurrentDate() });
        }

        return this.repository.updateProductById(product.id, payload);
    }

    async getProducts(client?: number, transportType?: TransportOptions, dc?: string) {
        let options: FindManyOptions<Product> = { relations: ['client'] };

        if (client) {
            options = { ...options, where: { client: { id: client } } }
        }

        if (transportType) {
            options = { ...options, where: { ...options.where, transportType: transportType } }
        }

        if(dc){
            options = { ...options, where: { ...options.where, dc: dc } }
        }

        return this.repository.getProducts(options);
    }

    async getPaginatedProducts(filters: ProductFilters) {
        let options: FindManyOptions<Product> = {
            order: { id: 'ASC' },
            take: filters.limit,
            skip: (filters.offset - 1) * filters.limit,
            relations: ['client']
        }

        if (filters.client) {
            options = { ...options, where: { ...options.where, client: { id: +filters.client } } }
        }

        if (filters.internationalCode) {
            options = { ...options, where: { ...options.where, internationalCode: Like(`%${filters.internationalCode}%`) } }
        }

        if (filters.localCode) {
            options = { ...options, where: { ...options.where, localCode: Like(`%${filters.localCode}%`) } }
        }

        if (filters.name) {
            options = { ...options, where: { ...options.where, name: Like(`%${filters.name}%`) } }
        }

        return this.repository.getPaginatedProducts(options);
    }
}