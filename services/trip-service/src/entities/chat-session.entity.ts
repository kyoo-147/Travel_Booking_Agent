import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { ChatMessageEntry } from './chat-message.entity';

@Entity('chat_sessions')
export class ChatSessionEntry {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index()
    userId: string;

    @Column({ nullable: true })
    title: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;

    @OneToMany(() => ChatMessageEntry, (message) => message.session)
    messages: ChatMessageEntry[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
