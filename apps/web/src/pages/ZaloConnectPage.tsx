import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Spin, Alert, Image, Badge, Space, List, Avatar, Row, Col } from 'antd';
import { QrcodeOutlined, ReloadOutlined, DisconnectOutlined, CheckCircleOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import { zaloService, ZaloSessionStatus } from '../api/zalo.service';

const { Title, Text, Paragraph } = Typography;

export const ZaloConnectPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<ZaloSessionStatus['status']>('pending');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [accountInfo, setAccountInfo] = useState<any>(null);
    const [polling, setPolling] = useState(false);

    const accountId = 'default'; // For MVP, single account

    const checkConnection = async () => {
        setLoading(true);
        try {
            const info = await zaloService.getAccountInfo(accountId);
            if (info && info.connected) {
                setAccountInfo(info.accountInfo);
                setStatus('success');
            } else {
                setStatus('pending');
            }
        } catch (e) {
            setStatus('pending');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkConnection();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (polling && (status === 'ready' || status === 'scanning' || status === 'pending')) {
            interval = setInterval(async () => {
                try {
                    const session = await zaloService.getLoginStatus(accountId);
                    setStatus(session.status);

                    if (session.qrCode) {
                        setQrCode(session.qrCode);
                    }

                    if (session.status === 'success') {
                        setPolling(false);
                        setAccountInfo(session.accountInfo);
                    } else if (session.status === 'expired' || session.status === 'error') {
                        // Don't stop polling immediately, waiting for potential recovery or user action
                        // setPolling(false); 
                        setError(session.error || 'Login failed');
                    }
                } catch (e) {
                    console.error('Polling error', e);
                }
            }, 500);
        }
        return () => clearInterval(interval);
    }, [polling, status]);

    const handleGenerateQR = async () => {
        setLoading(true);
        setError(null);
        try {
            await zaloService.generateLoginQR(accountId);
            // Quickly get the status to show QR
            // Quickly get the status to show QR
            const session = await zaloService.getLoginStatus(accountId);

            // Start polling if session is created (pending or ready)
            if (session.status === 'pending' || session.status === 'ready') {
                if (session.qrCode) {
                    setQrCode(session.qrCode);
                }
                setStatus(session.status);
                setPolling(true);
            }
        } catch (e) {
            setError('Could not generate QR code');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await zaloService.disconnect(accountId);
            setAccountInfo(null);
            setStatus('pending');
            setQrCode(null);
        } catch (e) {
            setError('Failed to disconnect');
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Title level={2}>Kết nối Zalo Agent</Title>
                    <Paragraph type="secondary">
                        Kết nối tài khoản Zalo của bạn để hệ thống có thể tự động liên hệ và đặt phòng với các chủ khách sạn.
                    </Paragraph>
                </div>

                {error && <Alert type="error" message={error} showIcon closable onClose={() => setError(null)} />}

                <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Spin size="large" tip="Đang tải..." />
                        </div>
                    ) : status === 'success' && accountInfo ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <CheckCircleOutlined style={{ fontSize: 64, color: '#10b981', marginBottom: 16 }} />
                            <Title level={3}>Đã kết nối thành công!</Title>
                            <Paragraph>
                                Tài khoản: <Text strong>{accountInfo.name}</Text>
                            </Paragraph>
                            <Space>
                                <Button danger icon={<DisconnectOutlined />} onClick={handleDisconnect}>
                                    Ngắt kết nối
                                </Button>
                                <Button icon={<CheckCircleOutlined />} onClick={async () => {
                                    try {
                                        await zaloService.startListener(accountId);
                                        alert('Đã khởi động listener thành công!');
                                    } catch (e) {
                                        alert('Lỗi khởi động listener: ' + e);
                                    }
                                }}>
                                    Khởi động Listener (Fix lỗi không nhận tin)
                                </Button>
                            </Space>

                            <div style={{ marginTop: 40, textAlign: 'left' }}>
                                <ZaloConversationsList accountId={accountId} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: 20 }}>
                            {qrCode ? (
                                <>
                                    <div style={{ border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 8, overflow: 'hidden' }}>
                                        <Image src={`data:image/png;base64,${qrCode}`} width={250} preview={false} />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        {status === 'scanning' ? (
                                            <Alert message="Đã quét mã! Vui lòng xác nhận trên điện thoại" type="info" showIcon />
                                        ) : (
                                            <Text type="secondary">Mở ứng dụng Zalo và quét mã này để đăng nhập</Text>
                                        )}
                                        <div style={{ marginTop: 16 }}>
                                            <Button icon={<ReloadOutlined />} onClick={handleGenerateQR}>Lấy mã mới</Button>
                                        </div>
                                    </div>
                                </>
                            ) : polling ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <Spin size="large" tip="Đang tạo mã QR..." />
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ background: '#f5f5f5', width: 200, height: 200, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <QrcodeOutlined style={{ fontSize: 64, color: '#d1d5db' }} />
                                    </div>
                                    <Button type="primary" size="large" onClick={handleGenerateQR} icon={<QrcodeOutlined />}>
                                        Tạo mã đăng nhập QR
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </Space>
        </div >
    );
};
const ZaloConversationsList: React.FC<{ accountId: string }> = ({ accountId }) => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            try {
                const data = await zaloService.getConversations(accountId);
                setConversations(data);
            } catch (error) {
                console.error('Failed to fetch conversations', error);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, [accountId]);

    const friends = conversations.filter((item: any) => item.type === 'friend' || item.type === 'user');
    const groups = conversations.filter((item: any) => item.type === 'group');

    if (loading) return <Spin />;

    const renderList = (data: any[]) => (
        <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item: any) => (
                <List.Item>
                    <List.Item.Meta
                        avatar={
                            item.avatarUrl ? (
                                <Avatar src={item.avatarUrl} size={40} />
                            ) : (
                                <Avatar icon={item.type === 'group' ? <TeamOutlined /> : <UserOutlined />} size={40} style={{ backgroundColor: item.type === 'group' ? '#1890ff' : '#87d068' }} />
                            )
                        }
                        title={item.title}
                        description={<Text type="secondary" style={{ fontSize: 12 }}>{item.id}</Text>}
                    />
                </List.Item>
            )}
            style={{ maxHeight: '400px', overflowY: 'auto' }}
        />
    );

    return (
        <Row gutter={24}>
            <Col span={12}>
                <Title level={5}>Bạn bè ({friends.length})</Title>
                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '0 16px' }}>
                    {renderList(friends)}
                </div>
            </Col>
            <Col span={12}>
                <Title level={5}>Nhóm ({groups.length})</Title>
                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '0 16px' }}>
                    {renderList(groups)}
                </div>
            </Col>
        </Row>
    );
};

export default ZaloConnectPage;
