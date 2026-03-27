import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./Product";

@Entity()
export class ProductPriceBinnacle {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('float')
    last_price: number;

    @Column('float')
    new_price: number;

    @ManyToOne(() => Product, (product) => product.prices, { nullable: false })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @CreateDateColumn()
    createdAt: Date;
}