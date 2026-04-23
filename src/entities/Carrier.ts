// Created by Luis

import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Carrier {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', length: 200 })
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    shippingCost: number;

    @Column({ type: 'date' })
    rateUpdatedAt: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
