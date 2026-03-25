import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Client, OrderProduct } from "./entities";

@Entity()
export class Product {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    localCode: string;

    @Column({ unique: true })
    internationalCode: string;

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

    @OneToMany(() => OrderProduct, order => order.product)
    orders: OrderProduct[];

    @ManyToOne(() => Client, client => client.products)
    @JoinColumn({ name: 'client_id' })
    client: Client;
}