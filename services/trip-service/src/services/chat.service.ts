import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSessionEntry } from '../entities/chat-session.entity';
import { ChatMessageEntry } from '../entities/chat-message.entity';
import { ChatSession, ChatMessage } from '@libs/common-types';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatSessionEntry)
        private chatSessionRepository: Repository<ChatSessionEntry>,
        @InjectRepository(ChatMessageEntry)
        private chatMessageRepository: Repository<ChatMessageEntry>,
    ) { }



    async ensureSystemSession(id: string, title: string): Promise<ChatSession> {
        let session = await this.chatSessionRepository.findOne({ where: { id } });
        if (!session) {
            session = this.chatSessionRepository.create({
                id, // Force ID to match BookingConversation
                userId: 'system-agent', // Shared user ID for system agents
                title,
                messages: [],
            });
            await this.chatSessionRepository.save(session);
        }
        return session as unknown as ChatSession;
    }

    async createSession(userId: string, title: string = 'New Chat'): Promise<ChatSession> {
        const session = this.chatSessionRepository.create({
            userId,
            title,
            messages: [],
        });
        return await this.chatSessionRepository.save(session) as unknown as ChatSession;
    }

    async getUserSessions(userId: string): Promise<ChatSession[]> {
        const sessions = await this.chatSessionRepository.find({
            where: { userId },
            order: { updatedAt: 'DESC' },
            relations: ['messages'],
        });
        return sessions as unknown as ChatSession[];
    }

    async getSession(id: string, userId: string): Promise<ChatSession> {
        const session = await this.chatSessionRepository.findOne({
            where: [
                { id, userId },
                { id, userId: 'system-agent' }
            ],
            relations: ['messages'],
        });

        if (!session) {
            throw new NotFoundException(`Chat session ${id} not found`);
        }

        // Sort messages by timestamp
        if (session.messages) {
            session.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        }

        return session as unknown as ChatSession;
    }

    async getMessages(sessionId: string): Promise<ChatMessage[]> {
        const messages = await this.chatMessageRepository.find({
            where: { sessionId },
            order: { timestamp: 'ASC' },
        });
        return messages as unknown as ChatMessage[];
    }

    async addMessage(
        sessionId: string,
        role: string,
        content: string,
        metadata?: any,
    ): Promise<ChatMessage> {
        const message = this.chatMessageRepository.create({
            sessionId,
            role: role as 'user' | 'assistant' | 'system',
            content,
            metadata,
        });
        const savedMessage = await this.chatMessageRepository.save(message);

        // Update session updatedAt
        await this.chatSessionRepository.update(sessionId, { updatedAt: new Date() });

        return savedMessage as unknown as ChatMessage;
    }

    async updateSessionTitle(id: string, userId: string, title: string): Promise<ChatSession> {
        const session = await this.getSession(id, userId);
        // session is ChatSession (interface). We need to save it. 
        // But repository expects Entity.
        // We should fetch entity again or cast.
        // Better: use update
        await this.chatSessionRepository.update({ id, userId }, { title });
        return await this.getSession(id, userId);
    }

    async deleteSession(id: string, userId: string): Promise<void> {
        const result = await this.chatSessionRepository.delete({ id, userId });
        if (result.affected === 0) {
            throw new NotFoundException(`Chat session ${id} not found`);
        }
    }
}
