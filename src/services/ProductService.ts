import { BadRequestError, ConflictError, NotFoundError } from "../infrastructure/infrastructure";
import { Client, Dc, Product } from "../entities/entities";
import { clientProvider } from "../providers/clientRepositoryProvider";
import { CreateOrUpdateProductPayload, ProductFilters } from "../interfaces/interfaces";
import { dcProvider } from "../providers/dcRepositoryProvider";
import { FindManyOptions, Like } from "typeorm";
import { getCurrentDate } from "../utils/date";
import { productPriceBinnacleRepository } from "../providers/productPriceBinnacleRepositoryProvider";
import { ProductRepository } from "../domain/domain";
import { TransportOptions } from "../entities/Order";
import ExcelJS from 'exceljs';

export class ProductService {
    constructor(private repository: ProductRepository) { }

    async _validateCodes(localCode: Product['localCode'], intCode: Product['internationalCode'], id?: Product['id']) {
        const productByLocalCode = await this.getProductByLocalCode(localCode);
        const productByInternationalCode = await this.getProductByInternationalCode(intCode);

        if (id) {
            if (productByLocalCode && productByLocalCode.id != id) {
                throw new ConflictError("El código local ya existe");
            }
            if (productByInternationalCode && productByInternationalCode.id != id) {
                throw new ConflictError("El código internacional ya existe");
            }
        } else {
            if (productByInternationalCode) throw new ConflictError("El código internacional ya existe");
            if (productByLocalCode) throw new ConflictError("El código local ya existe");
        }
    }


    _formatRow(row: ExcelJS.Row, client: Client, dc: Dc): CreateOrUpdateProductPayload {
        return {
            name: row.getCell(1).value as string,
            localCode: row.getCell(2).value as string,
            internationalCode: row.getCell(3).value as string,
            presentation: +row.getCell(4).value,
            price: +row.getCell(5).value,
            units_per_box: +row.getCell(6).value,
            boxes_per_pallet: +row.getCell(7).value,
            dc: dc,
            transportType: row.getCell(10).value as TransportOptions,
            client_id: client.id,
            client: client,
            dc_id: dc.id
        }
    }

    _validateTransportType(type: TransportOptions) {
        if (!Object.values(TransportOptions).includes(type)) {
            throw new BadRequestError("El tipo de transporte no existe");
        }
    }

    async getProductByLocalCode(code: Product['localCode']) {
        const product = this.repository.getProductByLocalCode(code);
        return product;
    }

    async getProductByInternationalCode(code: Product['localCode']) {
        const product = this.repository.getProductByInternationalCode(code);
        return product;
    }

    async createProduct(payload: CreateOrUpdateProductPayload) {
        // await this._validateCodes(payload.localCode, payload.internationalCode);
        const client = await clientProvider.getClientById(payload.client_id);
        payload.client = client;

        return this.repository.createProduct(payload);
    }

    async getProductById(id: Product['id']) {
        const product = await this.repository.getProductById(id);
        if (!product) throw new NotFoundError("El producto no existe");

        return product;
    }

    async updateProductById(id: Product['id'], payload: CreateOrUpdateProductPayload) {
        const product = await this.getProductById(id);
        const client = await clientProvider.getClientById(payload.client_id);
        const dc = await dcProvider.getDcById(payload.dc_id);

        if (!dc) throw new NotFoundError("El DC no existe");
        if (!client) throw new NotFoundError("El cliente no existe");
        
        payload.dc = dc;
        payload.client = client;

        if (product.price != payload.price) {
            await productPriceBinnacleRepository.updateProductPrice({ last_price: product.price, new_price: payload.price, product: product, createdAt: getCurrentDate() });
        }

        return this.repository.updateProductById(product.id, payload);
    }

    async getProducts(client?: number, transportType?: TransportOptions, dc?: Dc['id']) {
        let options: FindManyOptions<Product> = { relations: ['client', 'dc'] };

        if (client) {
            options = { ...options, where: { client: { id: client } } }
        }

        if (transportType) {
            options = { ...options, where: { ...options.where, transportType: transportType } }
        }

        if (dc) {
            options = { ...options, where: { ...options.where, dc: { id: dc } } }
        }

        return this.repository.getProducts(options);
    }

    async gerProductsByOptions(options: FindManyOptions<Product>) {
        return this.repository.getProducts(options);
    }

    async getPaginatedProducts(filters: ProductFilters) {
        let options: FindManyOptions<Product> = {
            order: { id: 'ASC' },
            take: filters.limit,
            skip: (filters.offset - 1) * filters.limit,
            relations: ['client', 'dc']
        }

        if (filters.client) {
            options = { ...options, where: { ...options.where, client: { id: +filters.client } } }
        }

        if (filters.internationalCode) {
            options = { ...options, where: { ...options.where, internationalCode: Like(`%${filters.internationalCode}%`) } }
        }

        if (filters.localCode) {
            options = { ...options, where: { ...options.where, localCode: Like(`%${filters.localCode}%`) } }
        }

        if (filters.name) {
            options = { ...options, where: { ...options.where, name: Like(`%${filters.name}%`) } }
        }

        if (filters.dc) {
            options = { ...options, where: { ...options.where, dc: { id: filters.dc } } }
        }

        return this.repository.getPaginatedProducts(options);
    }

    async uploadProducts(file: Express.Multer.File) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);
        const worksheet = workbook.getWorksheet(1);
        const clients = await clientProvider.getClients();
        const dcs = await dcProvider.getDcs();

        for (let i = 2; i <= worksheet.rowCount; i++) {
            const row = worksheet.getRow(i);

            const client = clients.find(client => client.name === row.getCell(8).value);
            const dc = dcs.find(dc => dc.code === row.getCell(9).value.toString());

            if (!client) throw new NotFoundError("El cliente no existe");
            if (!dc) throw new NotFoundError("El DC no existe");

            this._validateTransportType(row.getCell(10).value as TransportOptions);

            await this.createProduct(this._formatRow(row, client, dc));
        }
    }
}