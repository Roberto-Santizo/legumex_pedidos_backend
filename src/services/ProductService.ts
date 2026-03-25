import { ProductRepository } from "../domain/domain";
import { Product } from "../entities/entities";
import { ConflictError, NotFoundError } from "../infrastructure/infrastructure";
import { CreateOrUpdateProductPayload } from "../interfaces/interfaces";
import { clientProvider } from "../providers/clientRepositoryProvider";

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
        await this._validateCodes(payload.localCode, payload.internationalCode);
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
        await this._validateCodes(payload.localCode, payload.internationalCode, id);
        const client = await clientProvider.getClientById(payload.client_id);
        payload.client = client;

        return this.repository.updateProductById(product.id, payload);
    }

    async getProducts(client?: number) {
        return this.repository.getProducts(client);
    }

    async getPaginatedProducts(limit: number, offset: number){
        return this.repository.getPaginatedProducts(limit, offset);
    }
}