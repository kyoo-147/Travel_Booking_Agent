import React, { useState, useEffect } from 'react';
import { Card, Spin, Empty, Descriptions, Row, Col, Statistic, Alert } from 'antd';
import { ClockCircleOutlined, MessageOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { tripService } from '../services/trip.service';
import { MessageTimeline } from './MessageTimeline';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

interface Conversation {
    conversationId: string;
    sessionId: string;
    messages: Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp: string;
    }>;
    agentActions: Array<any>;
    hotelContact: {
        name: string;
        zaloPhone: string;
        zaloUserId?: string;
    };
    state: string;
    timeline: {
        started: string;
        completed: string;
        duration: number;
    };
}

interface ConversationViewerProps {
    tripId: string;
}

/**
 * Component to view agent conversation history for a trip
 */
export const ConversationViewer: React.FC<ConversationViewerProps> = ({ tripId }) => {
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchConversation();
    }, [tripId]);

    const fetchConversation = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await tripService.getConversation(tripId);
            setConversation(data);
        } catch (err: any) {
            console.error('Error fetching conversation:', err);
            setError(err.message || 'Failed to load conversation');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Đang tải lịch sử chat...</div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Lỗi"
                description={error}
                type="error"
                showIcon
            />
        );
    }

    if (!conversation) {
        return (
            <Empty
                description="Chuyến đi này không có lịch sử chat với AI Agent"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    const formatDuration = (seconds: number) => {
        const dur = dayjs.duration(seconds, 'seconds');
        const hours = Math.floor(dur.asHours());
        const minutes = dur.minutes();

        if (hours > 0) {
            return `${hours} giờ ${minutes} phút`;
        }
        return `${minutes} phút`;
    };

    const getStateColor = (state: string) => {
        const colors: Record<string, string> = {
            'CONFIRMED': '#52c41a',
            'CANCELLED': '#ff4d4f',
            'NEGOTIATING': '#faad14',
            'WAITING_USER_CONFIRM_PAYMENT': '#1890ff'
        };
        return colors[state] || '#1890ff';
    };

    return (
        <div>
            {/* Summary Statistics */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                    <Col xs={24} sm={8}>
                        <Statistic
                            title="Tổng số tin nhắn"
                            value={conversation.messages.length}
                            prefix={<MessageOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Statistic
                            title="Thời gian đàm phán"
                            value={(() => {
                                if (!conversation.messages.length) return '0 phút';
                                const times = conversation.messages.map(m => dayjs(m.timestamp).valueOf());
                                const durationSec = (Math.max(...times) - Math.min(...times)) / 1000;
                                const dur = dayjs.duration(durationSec, 'seconds');
                                const hours = Math.floor(dur.asHours());
                                const minutes = Math.max(1, dur.minutes()); // Minimum 1 minute
                                return hours > 0 ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
                            })()}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Statistic
                            title="Trạng thái"
                            value={conversation.state}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: getStateColor(conversation.state) }}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Hotel Contact Info */}
            <Card title="Thông tin khách sạn" style={{ marginBottom: 24 }}>
                <Descriptions column={2} size="small">
                    <Descriptions.Item label="Tên khách sạn">
                        {conversation.hotelContact.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại Zalo">
                        {conversation.hotelContact.zaloPhone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Bắt đầu đàm phán">
                        {dayjs(conversation.timeline.started).format('HH:mm DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Hoàn thành">
                        {dayjs(conversation.timeline.completed).format('HH:mm DD/MM/YYYY')}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Chat Timeline */}
            <Card title="Lịch sử chat">
                <MessageTimeline
                    messages={conversation.messages}
                    hotelName={conversation.hotelContact.name}
                />
            </Card>
        </div>
    );
};
