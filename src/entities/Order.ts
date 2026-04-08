import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Client, OrderProduct, User } from "./entities";

export enum TransportOptions {
    CROSSDOCK = "CROSSDOCK",
    PREPAID = "PREPAID",
    COLLECT = "COLLECT"
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @Column('int', { default: 1 })
    status: number;

    @Column('enum', { enum: TransportOptions, default: TransportOptions.CROSSDOCK })
    transportType: TransportOptions;

    @Column()
    dc: string;

    @Column()
    po: string;

    @Column()
    date: string;

    @Column('float', { nullable: true, default: 0 })
    total_lbs: number;

    @Column('float', { nullable: true, default: 0 })
    total_price: number;

    @Column('float', { nullable: true, default: 0 })
    total_boxes: number;

    @Column('float', { nullable: true, default: 0 })
    total_pallets: number;

    @Column()
    requiredByDate: string;

    @Column({ nullable: true })
    confirmationDate: string;

    @Column({ nullable: true })
    receviedConfirmatioDate: string;

    @ManyToOne(() => User, (user) => user.orders, { eager: true, nullable: false })
    @JoinColumn({ 'name': 'user_id' })
    user: User;

    @ManyToOne(() => User, (user) => user.orders, { eager: false, nullable: true })
    @JoinColumn({ 'name': 'confirmed_by' })
    confirmedBy: User;

    @ManyToOne(() => Client, (client) => client.orders, { nullable: false })
    @JoinColumn({ 'name': 'client_id' })
    client: Client;

    @OneToMany(() => OrderProduct, (product) => product.order, { eager: false, nullable: false })
    products: OrderProduct[];
}