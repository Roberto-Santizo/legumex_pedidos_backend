// Created by Luis

import { ContainerDatasourceImpl } from '../infrastructure/datasources/ContainerDatasourceImpl';
import { ContainerRepositoryImpl } from '../infrastructure/repositories/ContainerRepositoryImpl';
import { ContainerService } from '../services/ContainerService';

const datasource = new ContainerDatasourceImpl();
const repository = new ContainerRepositoryImpl(datasource);
export const containerProvider = new ContainerService(repository);
