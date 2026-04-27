import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Client } from "./Client";
import { Product } from "./Product";
import { Order } from "./Order";

@Entity()
export class Dc {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column({ default: '000' })
    code: string;

    @Column({ default: 'AC-BAYTOWN' })
    warehouse: string;

    @ManyToOne(() => Client, client => client.dcs)
    @JoinColumn({ name: 'client_id' })
    client: Client;

    @OneToMany(() => Order, order => order.dc)
    orders: Order[];

    @OneToMany(() => Product, product => product.dc)
    products: Product[];

    @CreateDateColumn()
    createdAt: Date;
}