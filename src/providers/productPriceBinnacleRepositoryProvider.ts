import { ProductPriceBinnacleDatasourceImpl, ProductPriceBinnacleRepositoryImpl } from "../infrastructure/infrastructure";
import { ProductPriceBinnacleService } from "../services/ProductPriceBinnacleService";

const datasource = new ProductPriceBinnacleDatasourceImpl();
const repository = new ProductPriceBinnacleRepositoryImpl(datasource);
export const productPriceBinnacleRepository = new ProductPriceBinnacleService(repository);