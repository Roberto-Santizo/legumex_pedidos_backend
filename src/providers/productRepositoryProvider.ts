import { ProductDatasourceImpl, ProductRepositoryImpl } from "../infrastructure/infrastructure";
import { ProductService } from "../services/ProductService";

const datasource = new ProductDatasourceImpl();
const repository = new ProductRepositoryImpl(datasource);
export const productProvider = new ProductService(repository);