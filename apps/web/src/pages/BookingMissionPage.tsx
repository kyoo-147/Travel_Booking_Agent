import React, { useState, useEffect } from 'react';
import {
    Card, Table, Tag, Typography, Button, Space, Input, Avatar,
    Tooltip, Badge, Empty
} from 'antd';
import {
    SearchOutlined, EyeOutlined, MessageOutlined,
    HomeOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { tripService, Trip, Conversation } from '../services/trip.service';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title } = Typography;

interface EnrichedBooking extends Trip {
    conversation?: Conversation;
    lastMessage?: string;
    lastMessageTime?: string;
}

/**
 * Booking Mission Page
 * Hiển thị danh sách các booking đang được AI Agent xử lý
 * Data source: Trip Service (thay vì AI Service trực tiếp)
 */
export const BookingMissionPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState<EnrichedBooking[]>([]);

    useEffect(() => {
        fetchBookings();
        const interval = setInterval(fetchBookings, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [user?.id]);

    const fetchBookings = async () => {
        if (!user?.id) return;

        try {
            // Fetch agent bookings from Trip Service
            const trips = await tripService.getAgentBookings(user.id);

            // Enrich with conversation data
            const enriched = await Promise.all(
                trips.map(async (trip) => {
                    try {
                        const conversation = await tripService.getConversation(trip.id);

                        if (conversation && conversation.messages.length > 0) {
                            const lastMsg = conversation.messages[conversation.messages.length - 1];

                            return {
                                ...trip,
                                conversation,
                                lastMessage: lastMsg.content,
                                lastMessageTime: lastMsg.timestamp
                            };
                        }
                    } catch (error) {
                        console.error(`Failed to load conversation for trip ${trip.id}`, error);
                    }

                    return trip;
                })
            );

            setBookings(enriched);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            'draft': 'default',
            'pending_booking': 'processing',
            'confirmed': 'success',
            'cancelled': 'error',
            'completed': 'success'
        };
        return colors[status] || 'default';
    };

    const getStateColor = (state: string): string => {
        const colors: Record<string, string> = {
            'INPUT_READY': 'blue',
            'CONTACTING_HOTEL': 'processing',
            'NEGOTIATING': 'warning',
            'WAITING_USER_CONFIRM_PAYMENT': 'orange',
            'CONFIRMED': 'success',
            'CANCELLED': 'error'
        };
        return colors[state] || 'default';
    };

    const filteredBookings = bookings.filter(booking =>
        !searchText ||
        booking.name.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.conversation?.hotelContact.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Khách sạn',
            key: 'hotel',
            render: (record: EnrichedBooking) => (
                <Space>
                    <Avatar
                        size="large"
                        icon={<HomeOutlined />}
                        style={{ backgroundColor: '#1890ff' }}
                    />
                    <div>
                        <Typography.Text strong>
                            {record.conversation?.hotelContact.name || 'Unknown Hotel'}
                        </Typography.Text>
                        <br />
                        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.destination.city}, {record.destination.country}
                        </Typography.Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Trạng thái Booking',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status.toUpperCase().replace('_', ' ')}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái Chat',
            key: 'chatState',
            render: (record: EnrichedBooking) => {
                if (!record.conversation) return <Tag>No Chat</Tag>;

                return (
                    <Space direction="vertical" size={0}>
                        <Tag color={getStateColor(record.conversation.state)}>
                            {record.conversation.state}
                        </Tag>
                        <Typography.Text type="secondary" style={{ fontSize: '11px' }}>
                            {record.conversation.messages.length} messages
                        </Typography.Text>
                    </Space>
                );
            }
        },
        {
            title: 'Tin nhắn cuối',
            key: 'lastMessage',
            render: (record: EnrichedBooking) => {
                if (!record.lastMessage) {
                    return <Typography.Text type="secondary">No messages</Typography.Text>;
                }

                return (
                    <div>
                        <Tooltip title={record.lastMessage}>
                            <Typography.Text ellipsis style={{ maxWidth: 200, display: 'block' }}>
                                {record.lastMessage}
                            </Typography.Text>
                        </Tooltip>
                        <Typography.Text type="secondary" style={{ fontSize: '11px' }}>
                            <ClockCircleOutlined /> {dayjs(record.lastMessageTime).fromNow()}
                        </Typography.Text>
                    </div>
                );
            }
        },
        {
            title: 'Cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date: Date) => dayjs(date).format('HH:mm DD/MM/YYYY')
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (record: EnrichedBooking) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/ trips / ${record.id} `)}
                    >
                        Xem Trip
                    </Button>
                    {record.conversation && (
                        <Badge dot={record.conversation.state === 'NEGOTIATING'}>
                            <Button
                                icon={<MessageOutlined />}
                                type="primary"
                                onClick={() => navigate(`/ trips / ${record.id}?tab = conversation`)}
                            >
                                Chat
                            </Button>
                        </Badge>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Nhiệm vụ đặt phòng (Booking Mission)</Title>
            <Typography.Paragraph type="secondary">
                Theo dõi các booking đang được AI Agent xử lý
            </Typography.Paragraph>

            <div style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Tìm kiếm khách sạn hoặc địa điểm..."
                    prefix={<SearchOutlined />}
                    style={{ width: 400 }}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                />
            </div>

            {filteredBookings.length === 0 && !loading ? (
                <Card>
                    <Empty
                        description="Chưa có booking nào qua AI Agent"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button type="primary" onClick={() => navigate('/chat')}>
                            Tạo booking mới
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <Table
                    columns={columns}
                    dataSource={filteredBookings}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng ${total} bookings`
                    }}
                />
            )}
        </div>
    );
};
