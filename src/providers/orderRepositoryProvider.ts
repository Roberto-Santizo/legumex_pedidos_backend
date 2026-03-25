import { OrderDatasourceImpl, OrderRepositoryImpl } from "../infrastructure/infrastructure";
import { OrderService } from "../services/OrderService";

const datasource = new OrderDatasourceImpl();
const repository = new OrderRepositoryImpl(datasource);
export const orderProvider = new OrderService(repository);