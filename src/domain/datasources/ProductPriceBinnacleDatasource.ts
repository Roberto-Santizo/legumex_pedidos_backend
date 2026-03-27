import { ProductPriceBinnacle } from "../../entities/entities";
import { UpdateProductPricePayload } from "../../interfaces/interfaces";

export abstract class ProductPriceBinnacleDatasource {
    abstract updateProductPrice(payload: UpdateProductPricePayload): Promise<ProductPriceBinnacle>;
}