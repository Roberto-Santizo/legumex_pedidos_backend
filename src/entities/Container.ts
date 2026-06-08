
import {Column,CreateDateColumn,Entity,Index,JoinColumn,ManyToOne,OneToMany,PrimaryGeneratedColumn} from 'typeorm';
import { User } from './User';
import { TransportOptions } from './Order'; // Reuse existing enum — do NOT redeclare
import { ContainerOrder } from './ContainerOrder';
import { Carrier } from './Carrier';

export enum ContainerStatus {
    DRAFT = 'draft',
    CONFIRMED = 'confirmed',
}

@Entity()
@Index(['weekStart', 'weekEnd'])
@Index(['status'])
@Index(['weekStart', 'transportType'])
export class Container {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('enum', { enum: TransportOptions })
    transportType: TransportOptions;

    @Column({ type: 'date' })
    weekStart: string;

    // Sunday of the week this container belongs to (ISO date string YYYY-MM-DD)
    @Column({ type: 'date' })
    weekEnd: string;

    @Column('enum', { enum: ContainerStatus, default: ContainerStatus.DRAFT })
    status: ContainerStatus;

    @Column('float', { default: 0 })
    totalPallets: number;

    @Column('float', { default: 0 })
    totalPounds: number;

    @Column('int', { default: 0 })
    totalOrders: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    createdBy: User;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    confirmedAt: Date | null;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'confirmed_by' })
    confirmedBy: User | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    notes: string | null;

    @OneToMany(() => ContainerOrder, (containerOrder) => containerOrder.container, { cascade: true })
    containerOrders: ContainerOrder[];

    // Transport assignment — set after the container is confirmed
    @ManyToOne(() => Carrier, { nullable: true, eager: false })
    @JoinColumn({ name: 'carrier_id' })
    carrier: Carrier | null;

    // Shipping cost frozen at the moment the carrier was assigned — never changes
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    carrierCostSnapshot: number | null;

    // Delivery schedule — set after carrier is assigned
    @Column({ type: 'date', nullable: true })
    deliveryDate: string | null;

    @Column({ type: 'time', nullable: true })
    deliveryTime: string | null;
}
