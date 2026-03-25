import { ClientDatasourceImpl } from "../infrastructure/datasources/ClientDatasourceImpl";
import { ClientRepositoryImpl } from "../infrastructure/repositories/ClientRepositoryImpl";
import { ClientService } from "../services/ClientService";

const datasource = new ClientDatasourceImpl();
const repository = new ClientRepositoryImpl(datasource);
export const clientProvider = new ClientService(repository);