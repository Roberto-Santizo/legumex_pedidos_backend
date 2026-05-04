// Created by Luis

import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Carrier } from './Carrier';

@Entity()
export class CarrierRate {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => Carrier, { onDelete: 'CASCADE', eager: false })
    @JoinColumn({ name: 'carrier_id' })
    carrier: Carrier;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    cost: number;

    @Column({ type: 'date' })
    effectiveDate: string;

    @CreateDateColumn()
    createdAt: Date;
}
