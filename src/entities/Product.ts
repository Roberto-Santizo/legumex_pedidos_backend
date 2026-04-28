import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Client, Dc, OrderProduct } from "./entities";
import { ProductPriceBinnacle } from "./ProductPriceBinnacle";
import { TransportOptions } from "./Order";

@Entity()
export class Product {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    name: string;

    @Column()
    localCode: string;

    @Column()
    internationalCode: string;

    @Column()
    auxCode: string;

    @Column('enum', { enum: TransportOptions, default: TransportOptions.CROSSDOCK })
    transportType: TransportOptions;

    @Column('float')
    price: number;

    @Column('float')
    presentation: number;

    @Column('int', { default: 1 })
    units_per_box: number;

    @Column('int', { default: 1 })
    boxes_per_pallet: number;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Dc, dc => dc.products)
    @JoinColumn({ name: 'dc_id' })
    dc: Dc;

    @OneToMany(() => OrderProduct, order => order.product)
    orders: OrderProduct[];

    @OneToMany(() => ProductPriceBinnacle, priceBinnacle => priceBinnacle.product)
    prices: ProductPriceBinnacle[];

    @ManyToOne(() => Client, client => client.products)
    @JoinColumn({ name: 'client_id' })
    client: Client;
}