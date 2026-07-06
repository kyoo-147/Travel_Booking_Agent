import React from 'react';
import { Timeline, Card, Typography, Avatar, Space } from 'antd';
import { RobotOutlined, HomeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Paragraph } = Typography;

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface MessageTimelineProps {
    messages: Message[];
    hotelName?: string;
}

/**
 * Timeline component to display chat messages between agent and hotel
 */
export const MessageTimeline: React.FC<MessageTimelineProps> = ({
    messages,
    hotelName = 'Khách sạn'
}) => {
    const formatTime = (timestamp: string) => {
        return dayjs(timestamp).format('HH:mm DD/MM/YYYY');
    };

    const getRelativeTime = (timestamp: string) => {
        return dayjs(timestamp).fromNow();
    };

    if (!messages || messages.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                Chưa có tin nhắn
            </div>
        );
    }

    return (
        <Timeline mode="left">
            {messages.map((msg, index) => {
                const isAgent = msg.role === 'user';

                return (
                    <Timeline.Item
                        key={index}
                        color={isAgent ? '#1890ff' : '#52c41a'}
                        dot={
                            <Avatar
                                size="small"
                                icon={isAgent ? <RobotOutlined /> : <HomeOutlined />}
                                style={{
                                    backgroundColor: isAgent ? '#1890ff' : '#52c41a'
                                }}
                            />
                        }
                        label={
                            <Space direction="vertical" size={0}>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {formatTime(msg.timestamp)}
                                </Text>
                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                    {getRelativeTime(msg.timestamp)}
                                </Text>
                            </Space>
                        }
                    >
                        <Card
                            size="small"
                            style={{
                                maxWidth: 500,
                                backgroundColor: isAgent ? '#e6f7ff' : '#f6ffed',
                                borderColor: isAgent ? '#91d5ff' : '#b7eb8f'
                            }}
                            bodyStyle={{ padding: '12px' }}
                        >
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                <Text strong style={{ color: isAgent ? '#1890ff' : '#52c41a' }}>
                                    {isAgent ? '🤖 AI Agent' : `🏨 ${hotelName}`}
                                </Text>
                                <Paragraph
                                    style={{ margin: 0, whiteSpace: 'pre-wrap' }}
                                    ellipsis={{ rows: 10, expandable: true, symbol: 'Xem thêm' }}
                                >
                                    {msg.content}
                                </Paragraph>
                            </Space>
                        </Card>
                    </Timeline.Item>
                );
            })}
        </Timeline>
    );
};
