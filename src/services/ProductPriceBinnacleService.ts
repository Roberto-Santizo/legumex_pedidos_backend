import { ProductPriceBinnacleRepository } from "../domain/domain";
import { UpdateProductPricePayload } from "../interfaces/interfaces";

export class ProductPriceBinnacleService {
    constructor(private repository: ProductPriceBinnacleRepository) { }

    async updateProductPrice(payload: UpdateProductPricePayload) {
        return this.repository.updateProductPrice(payload);
    }
}