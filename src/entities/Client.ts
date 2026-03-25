import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./Product";
import { UserClient } from "./UserClient";
import { Order } from "./Order";

@Entity()
export class Client {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Product, product => product.client)
    products: Product[];

    @OneToMany(() => Order, order => order.client)
    orders: Order[];

    @OneToMany(() => UserClient, user => user.client)
    users: UserClient[];
}