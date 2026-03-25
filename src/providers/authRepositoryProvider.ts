import { AuthDatasourceImpl, AuthRepositoryImpl } from "../infrastructure/infrastructure";
import { AuthService } from "../services/AuthService";

const datasource = new AuthDatasourceImpl();
const repository = new AuthRepositoryImpl(datasource);

export const authProvider = new AuthService(repository);