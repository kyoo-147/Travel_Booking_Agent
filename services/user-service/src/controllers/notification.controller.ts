import { Controller, Get, Put, Delete, Param, Query, Req, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import { NotificationStatus } from '../entities/notification.entity';
import { Request } from 'express';
import { NotificationGateway } from '../websocket/notification.gateway';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('notifications')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway // Properly typed
  ) { }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông báo' })
  @ApiQuery({ name: 'status', enum: NotificationStatus, required: false })
  @ApiResponse({ status: 200, description: 'Danh sách thông báo' })
  async getNotifications(@Req() req: AuthenticatedRequest, @Query('status') status?: NotificationStatus) {
    const userId = req.user?.id || req.headers['user-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    return this.notificationService.getUserNotifications(userId, status);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Lấy số thông báo chưa đọc' })
  @ApiResponse({ status: 200, description: 'Số thông báo chưa đọc' })
  async getUnreadCount(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id || req.headers['user-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Đánh dấu thông báo đã đọc' })
  @ApiParam({ name: 'id', description: 'ID thông báo' })
  @ApiResponse({ status: 200, description: 'Đã đánh dấu đã đọc' })
  async markAsRead(@Param('id') notificationId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id || req.headers['user-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    await this.notificationService.markAsRead(notificationId, userId);
    return { message: 'Đã đánh dấu đã đọc' };
  }

  @Put('mark-all-read')
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo đã đọc' })
  @ApiResponse({ status: 200, description: 'Đã đánh dấu tất cả đã đọc' })
  async markAllAsRead(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id || req.headers['user-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    await this.notificationService.markAllAsRead(userId);
    return { message: 'Đã đánh dấu tất cả đã đọc' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thông báo' })
  @ApiParam({ name: 'id', description: 'ID thông báo' })
  @ApiResponse({ status: 200, description: 'Đã xóa thông báo' })
  async deleteNotification(@Param('id') notificationId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id || req.headers['user-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    await this.notificationService.deleteNotification(notificationId, userId);
    return { message: 'Đã xóa thông báo' };
  }

  @Post('emit-booking-payment')
  async emitBookingPaymentRequest(@Body() payload: {
    userId: string;
    sessionId: string;
    agentResponse: any;
  }) {
    const { userId, sessionId, agentResponse } = payload;
    console.log(`[NotificationController] 💰 Emitting payment request to user ${userId}`);
    if (this.notificationGateway) {
      this.notificationGateway.sendNotificationToUser(userId, {
        type: 'booking_payment_request',
        sessionId,
        ...agentResponse
      });
    }
    return { success: true };
  }
}