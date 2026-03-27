import appDatasource from '../../config/datasource';
import { ProductPriceBinnacleDatasource, ProductPriceBinnacleRepository } from '../../domain/domain';
import { ProductPriceBinnacle } from '../../entities/entities';
import { UpdateProductPricePayload } from '../../interfaces/interfaces';

export class ProductPriceBinnacleRepositoryImpl implements ProductPriceBinnacleRepository {
    constructor(private datasource: ProductPriceBinnacleDatasource) { }

    updateProductPrice(payload: UpdateProductPricePayload): Promise<ProductPriceBinnacle> {
        return this.datasource.updateProductPrice(payload);
    }

}