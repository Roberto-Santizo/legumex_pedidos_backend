import { ProductPriceBinnacle } from "../../entities/entities";
import { UpdateProductPricePayload } from "../../interfaces/interfaces";

export abstract class ProductPriceBinnacleRepository {
    abstract updateProductPrice(payload: UpdateProductPricePayload): Promise<ProductPriceBinnacle>;
}