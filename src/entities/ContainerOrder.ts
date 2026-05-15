
import { Column,CreateDateColumn,Entity,JoinColumn, ManyToOne,PrimaryGeneratedColumn,} from 'typeorm';
import { Container } from './Container';
import { Order } from './Order';
import { User } from './User';

@Entity()
export class ContainerOrder {
    @PrimaryGeneratedColumn('increment')
    id: number;

    // orderId is declared as a physical column (unique: true) so one order can only belong to one container
    @Column({ type: 'int', name: 'order_id', unique: true })
    orderId: number;

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    // containerId declared as a column for easy querying when recalculating totals
    @Column({ type: 'int', name: 'container_id' })
    containerId: number;

    // CASCADE: deleting a Container automatically removes all its ContainerOrder rows,
    // which effectively "releases" those orders back to the available pool
    @ManyToOne(() => Container, (c) => c.containerOrders, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'container_id' })
    container: Container;

    @CreateDateColumn()
    addedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'added_by' })
    addedBy: User;

    // Snapshot values at the moment the order was added.
    // These are used for totalPallets/totalPounds recalculation and are
    // intentionally decoupled from the live order values.
    @Column('float')
    snapshotPallets: number;

    @Column('float')
    snapshotPounds: number;
}
