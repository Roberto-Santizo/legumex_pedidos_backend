import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User, Client } from "./entities";

@Entity()
export class UserClient {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => Client, client => client.users, { nullable: false })
    @JoinColumn({ name: 'client_id' })
    client: Client;

    @ManyToOne(() => User, user => user.clients, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: User;
}