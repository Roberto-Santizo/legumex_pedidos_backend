import { OrderDatasourceImpl, OrderRepositoryImpl } from "../infrastructure/infrastructure";
import { GeminiImpl } from "../infrastructure/providers/GeminiImpl";
import { OrderService } from "../services/OrderService";

const datasource = new OrderDatasourceImpl();
const repository = new OrderRepositoryImpl(datasource);
const gemini = new GeminiImpl();
export const orderProvider = new OrderService(repository, gemini);