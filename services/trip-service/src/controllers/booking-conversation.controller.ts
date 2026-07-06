import { Controller, Get, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingConversation } from '../entities/booking-conversation.entity';

@Controller('bookings/conversations')
export class BookingConversationController {
    private readonly logger = new Logger(BookingConversationController.name);

    constructor(
        @InjectRepository(BookingConversation)
        private conversationRepo: Repository<BookingConversation>,
    ) { }

    @Get()
    async findAll() {
        this.logger.log('Fetching all booking conversations');
        const items = await this.conversationRepo.find({
            order: { updatedAt: 'DESC' }
        });
        return items;
    }
}
