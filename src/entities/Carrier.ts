// Created by Luis

import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Dc } from './Dc';

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

    @ManyToOne(() => Dc, { nullable: true, eager: false })
    @JoinColumn({ name: 'dc_id' })
    dc: Dc | null;
}
