import { DcDatasourceImpl } from "../infrastructure/datasources/DcDatasourceImpl";
import { DcRepositoryImpl } from "../infrastructure/repositories/DcRepositoryImpl";
import { DcService } from "../services/DcService";

const datasource = new DcDatasourceImpl();
const repository = new DcRepositoryImpl(datasource);
export const dcProvider = new DcService(repository);