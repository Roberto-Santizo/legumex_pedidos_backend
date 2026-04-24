import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product, Order } from "./entities";

@Entity()
export class OrderProduct {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('int')
    total_boxes: number;

    @ManyToOne(() => Product, (product) => product.orders, { eager: false, nullable: false })
    @JoinColumn({ 'name': 'product_id' })
    product: Product;

    @ManyToOne(() => Order, (order) => order.products, { eager: false, nullable: false })
    @JoinColumn({ 'name': 'order_id' })
    order: Order

    @CreateDateColumn()
    createdAt: Date;
}