import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { ChatSessionEntry } from './chat-session.entity';

@Entity('chat_messages')
export class ChatMessageEntry {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index()
    sessionId: string;

    @Column()
    role: 'user' | 'assistant' | 'system';

    @Column('text')
    content: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;

    @ManyToOne(() => ChatSessionEntry, (session) => session.messages, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'sessionId' })
    session: ChatSessionEntry;

    @CreateDateColumn()
    timestamp: Date;
}
