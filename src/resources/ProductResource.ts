import { Product } from "../entities/entities";

export class ProductResource {
    static jsonDetails(product: Product) {
        return {
            id: product.id,
            name: product.name,
            localCode: product.localCode,
            internationalCode: product.internationalCode,
            price: product.price,
            presentation: product.presentation,
            units_per_box: product.units_per_box,
            client_id: product.client.id,
            client: product.client.name,
            boxes_per_pallet: product.boxes_per_pallet
        }
    }

    static collection(products: Product[]){
        return products.map((product) => this.jsonDetails(product));
    }
}