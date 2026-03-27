import { Repository } from "typeorm";
import { ProductPriceBinnacleDatasource } from "../../domain/domain";
import { ProductPriceBinnacle } from "../../entities/entities";
import { UpdateProductPricePayload } from "../../interfaces/interfaces";
import appDatasource from "../../config/datasource";

export class ProductPriceBinnacleDatasourceImpl implements ProductPriceBinnacleDatasource {
    private repository: Repository<ProductPriceBinnacle>;

    constructor() {
        this.repository = appDatasource.getRepository(ProductPriceBinnacle);
    }

    updateProductPrice(payload: UpdateProductPricePayload): Promise<ProductPriceBinnacle> {
        return this.repository.save(payload);
    }
}