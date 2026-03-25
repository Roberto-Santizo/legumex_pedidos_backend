import { OrderProductDatasourceImpl, OrderProductRepositoryImpl } from "../infrastructure/infrastructure";
import { OrderProductService } from "../services/OrderProductService";

const datasource = new OrderProductDatasourceImpl();
const repository = new OrderProductRepositoryImpl(datasource);

export const orderProductProvider = new OrderProductService(repository);
