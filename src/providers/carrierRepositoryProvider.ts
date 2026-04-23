// Created by Luis

import { CarrierDatasourceImpl } from '../infrastructure/datasources/CarrierDatasourceImpl';
import { CarrierRepositoryImpl } from '../infrastructure/repositories/CarrierRepositoryImpl';
import { CarrierService } from '../services/CarrierService';

const datasource = new CarrierDatasourceImpl();
const repository = new CarrierRepositoryImpl(datasource);
export const carrierProvider = new CarrierService(repository);
