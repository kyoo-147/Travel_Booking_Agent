import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Request,
    Patch,
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assuming Auth Guard exists or will be used. 
// For MVP if auth guard is not readily available in this service, we might skip or rely on gateway.
// But user info is needed. Let's assume req.user is populated by some middleware/guard.

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('sessions')
    async createSession(@Body() body: { userId: string; title?: string }) {
        // In a real app, userId should come from JWT token via Guard
        return await this.chatService.createSession(body.userId, body.title);
    }

    @Get('sessions/user/:userId')
    async getUserSessions(@Param('userId') userId: string) {
        return await this.chatService.getUserSessions(userId);
    }

    @Get('sessions/:id/user/:userId') // Adding userId to path for simple ownership check for now
    async getSession(@Param('id') id: string, @Param('userId') userId: string) {
        return await this.chatService.getSession(id, userId);
    }

    @Post('sessions/:id/messages')
    async addMessage(
        @Param('id') sessionId: string,
        @Body() body: { role: string; content: string; metadata?: any },
    ) {
        return await this.chatService.addMessage(
            sessionId,
            body.role,
            body.content,
            body.metadata,
        );
    }

    @Patch('sessions/:id')
    async updateSession(
        @Param('id') id: string,
        @Body() body: { userId: string; title: string },
    ) {
        return await this.chatService.updateSessionTitle(id, body.userId, body.title);
    }

    @Delete('sessions/:id')
    async deleteSession(@Param('id') id: string, @Body() body: { userId: string }) {
        await this.chatService.deleteSession(id, body.userId);
        return { success: true };
    }
}
