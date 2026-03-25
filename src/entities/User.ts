import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./entities";
import { UserClient } from "./UserClient";

@Entity()
export class User {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    name: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    role: string;

    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];
    
    @OneToMany(() => Order, (order) => order.confirmedBy)
    confirmations: Order[];

    @OneToMany(() => UserClient, user => user.user)
    clients: UserClient[];

    @CreateDateColumn()
    createdAt: Date;
}
