import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Client } from "./Client";

@Entity()
export class Dc {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column({default: '000'})
    code: string;

    @ManyToOne(() => Client, client => client.dcs)
    @JoinColumn({ name: 'client_id' })
    client: Client;

    @CreateDateColumn()
    createdAt: Date;
}