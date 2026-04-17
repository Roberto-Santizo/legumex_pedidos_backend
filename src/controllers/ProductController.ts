import { CreateOrUpdateProductPayload, ProductFilters } from "../interfaces/interfaces";
import { errorHandler, responseHandler } from "../helpers/httpHelpers";
import { Product } from "../entities/entities";
import { productProvider } from '../providers/productRepositoryProvider';
import { ProductResource } from '../resources/resources';
import { Request, Response } from "express";
import { TransportOptions } from "../entities/Order";

export abstract class ProductController {
    static async store(req: Request<{}, {}, CreateOrUpdateProductPayload>, res: Response) {
        try {
            await productProvider.createProduct(req.body);
            responseHandler(res, 201, 'Producto Creado Correctamente');
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async index(req: Request, res: Response) {
        try {
            const { client, transportType, dc } = req.query;
            const products = await productProvider.getProducts(+client, transportType as TransportOptions, dc as string);

            responseHandler(res, 200, 'Productos Obtenidos Correctamente', ProductResource.collection(products));
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async getPaginatedProducts(req: Request<{}, {}, {}, ProductFilters>, res: Response) {
        try {
            const { limit, offset } = req.query;
            const [products, total] = await productProvider.getPaginatedProducts(req.query);

            const response = {
                response: ProductResource.collection(products),
                total: total,
                page: +offset,
                lastPage: Math.ceil(total / +limit)
            }

            responseHandler(res, 200, 'Productos Obtenidos Correctamente', response);
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async get(req: Request<{ id: Product['id'] }>, res: Response) {
        try {
            const product = await productProvider.getProductById(req.params.id);

            responseHandler(res, 200, 'Producto Obtenidos Correctamente', ProductResource.jsonDetails(product));
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async update(req: Request<{ id: Product['id'] }, {}, CreateOrUpdateProductPayload>, res: Response) {
        try {
            await productProvider.updateProductById(req.params.id, req.body);

            responseHandler(res, 200, 'Producto Actualizado Correctamente');
        } catch (error) {
            errorHandler(error, res);
        }
    }

    static async uploadProducts(req: Request, res: Response) {
        try {
            await productProvider.uploadProducts(req.file);

            responseHandler(res, 200, 'Productos Creados Correctamente');
        } catch (error) {
            errorHandler(error, res);
        }
    }
}