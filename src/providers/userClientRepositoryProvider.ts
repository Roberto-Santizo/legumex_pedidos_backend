import { UserClientDatasourceImpl } from "../infrastructure/datasources/UserClientDatasourceImpl";
import { UserClientRepositoryImpl } from "../infrastructure/repositories/UserClientRepositoryImpl";
import { UserClientService } from "../services/UserClientService";

const datasource = new UserClientDatasourceImpl();
const repository = new UserClientRepositoryImpl(datasource);
export const userClientProvider = new UserClientService(repository);