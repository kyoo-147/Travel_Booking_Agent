import React, { useState, useEffect } from 'react';
import realtimeService from '../../services/realtimeService';
import {
  Card,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Avatar,
  Typography,
  message,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  List,
  Divider,
  Empty,
  Tabs,
  TabsProps,
  Spin,
  Popconfirm,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  MessageOutlined,
  UserAddOutlined,
  UserOutlined,
  TeamOutlined,
  HeartOutlined,
  CarOutlined,
  GlobalOutlined,
  LinkOutlined,
  MailOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  RobotOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { travelCompanionApi } from '../../services/travel-companion.service';
import { useAuth } from '../../contexts/AuthContext';
import webSocketService from '../../services/websocket.service';
import { showPushNotification } from '../../services/push-notification.service';

const { Title, Text } = Typography;
const { Option } = Select;

interface TravelCompanion {
  id: string;
  userId: string;
  companionId: string;
  relationship: 'family' | 'friend' | 'colleague';
  status: 'connected' | 'pending' | 'blocked';
  currentStatus: 'online' | 'traveling' | 'offline';
  role: 'primary' | 'companion';
  sharedTrips: number;
  lastTripDate?: string;
  connectionDate: string;
  travelPreferences?: {
    foodStyle: string[];
    activityLevel: 'low' | 'medium' | 'high';
    budgetRange: string;
  };
  aiPersonalNotes?: {
    foodPreferences: string[];
    mobilityLevel: 'low_walking' | 'medium_walking' | 'high_walking';
    travelHabits: string[];
    conflictPoints?: string[];
    compatibilityScore?: number;
  };
  companion: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

interface PendingInvitation {
  id: string;
  senderId: string;
  recipientId?: string;
  recipientEmail?: string;
  recipientName?: string;
  type: 'email' | 'link' | 'user_id' | 'system';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  inviteCode?: string;
  expiresAt?: string;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

export const UserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [companions, setCompanions] = useState<TravelCompanion[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [isViewingUserCode, setIsViewingUserCode] = useState(false);
  const [activeTab, setActiveTab] = useState('companions');
  const [stats, setStats] = useState({
    totalCompanions: 0,
    primaryTravelers: 0,
    companions: 0,
    connected: 0,
    pending: 0,
    totalTrips: 0,
    avgCompatibility: 0
  });
  const [form] = Form.useForm();
  const [currentUserCode, setCurrentUserCode] = useState<string>('');

  useEffect(() => {
    // Load data when user is available
    if (user?.id) {
      loadData();
      loadUserCode();
      
      // Set up WebSocket listeners for real-time updates
      const unsubscribeInvitation = webSocketService.onNewInvitation((data) => {
        console.log('🔔 [UserManagement] New invitation received, refreshing data...', data);
        loadData();
      });

      const unsubscribeAccepted = webSocketService.onInvitationAccepted((data) => {
        console.log('✅ [UserManagement] Invitation accepted, refreshing data...', data);
        
        // Show push notification to sender
        showPushNotification({
          type: 'accepted',
          title: 'Lời mời được chấp nhận!',
          message: data.message || 'Có người vừa chấp nhận lời mời kết nối của bạn',
          onClick: () => {
            // Focus on companions tab if needed
            console.log('Clicked on invitation accepted notification');
          }
        });
        
        loadData();
      });

      const unsubscribeNotification = webSocketService.onNotification((data) => {
        console.log('📢 [UserManagement] General notification received:', data);
        
        if (data.type === 'invitation_accepted') {
          showPushNotification({
            type: 'accepted',
            title: data.title,
            message: data.message,
            onClick: () => {
              setActiveTab('companions');
              loadData();
            }
          });
          
          if (data.data?.refreshCompanions) {
            loadData();
          }
        } else if (data.type === 'companion_removed') {
          showPushNotification({
            type: 'warning',
            title: data.title || 'Người đồng hành đã được xóa',
            message: data.message || 'Danh sách đồng hành đã được cập nhật',
            onClick: () => {
              // Focus on companions tab if needed
              setActiveTab('companions');
            }
          });
          loadData();
        }
      });

      const unsubscribeUserStatusChange = webSocketService.onUserStatusChange((data) => {
        console.log('👤 [UserManagement] User status change:', data);
        
        // Update companions list when any user's status changes
        // This will refresh the online/offline status
        setCompanions(prevCompanions => 
          prevCompanions.map(companion => {
            if (companion.companion?.id === data.userId) {
              return {
                ...companion,
                currentStatus: data.status === 'online' ? 'online' : 'offline'
              };
            }
            return companion;
          })
        );
      });

      return () => {
        unsubscribeInvitation();
        unsubscribeAccepted();
        unsubscribeNotification();
        unsubscribeUserStatusChange();
      };
    }
  }, [user?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [companionsData, invitationsData, statsData] = await Promise.all([
        travelCompanionApi.getCompanions(),
        travelCompanionApi.getPendingInvitations(),
        travelCompanionApi.getStats()
      ]);
      
      console.log('📊 [LoadData] Companions received from backend:', companionsData.map(c => ({
        name: `${c.companion?.firstName || 'Unknown'} ${c.companion?.lastName || ''}`,
        companionId: c.companion?.id,
        currentStatus: c.currentStatus,
        status: c.status
      })));
      
      setCompanions(companionsData);
      setPendingInvitations(invitationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      message.error('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserCode = async () => {
    try {
      const { code } = await travelCompanionApi.getMyCode();
      setCurrentUserCode(code);
    } catch (error) {
      console.error('Failed to load user code:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleInviteCompanion = () => {
    setIsInviteModalVisible(true);
  };

  const handleViewUserCode = () => {
    setIsViewingUserCode(true);
  };

  const handleSendInvitation = async () => {
    try {
      const values = form.getFieldsValue();
      const inviteMethod = values.inviteMethod || 'userCode'; // Default to userCode
      
      if (inviteMethod === 'email') {
        // Validate email specific fields
        if (!values.email) {
          message.error('Vui lòng nhập email!');
          return;
        }
        if (!values.relationship) {
          message.error('Vui lòng chọn mối quan hệ!');
          return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(values.email)) {
          message.error('Email không hợp lệ!');
          return;
        }
        
        await travelCompanionApi.createInvitation({
          type: 'email',
          recipientEmail: values.email,
          recipientName: values.name,
          message: values.message
        });
        message.success('Đã gửi lời mời qua email!');
      } else if (inviteMethod === 'userCode') {
        // Validate userCode specific fields
        if (!values.userCode) {
          message.error('Vui lòng nhập mã người dùng!');
          return;
        }
        if (!values.relationship) {
          values.relationship = 'friend'; // Set default if not provided
        }
        
        await travelCompanionApi.connectByCode({
          userCode: values.userCode,
          relationship: values.relationship,
          message: values.message
        });
        message.success('Đã gửi lời mời kết nối!');
      } else if (inviteMethod === 'link') {
        // Validate link specific fields
        if (!values.relationship) {
          values.relationship = 'friend'; // Set default if not provided
        }
        
        const { inviteLink } = await travelCompanionApi.generateInviteLink({
          relationship: values.relationship,
          message: values.message
        });
        
        // Copy link to clipboard
        await navigator.clipboard.writeText(inviteLink);
        message.success('Đã tạo link mời và copy vào clipboard!');
      }

      setIsInviteModalVisible(false);
      form.resetFields();
      
      // Immediate refresh after sending invitation
      loadData();
    } catch (error: any) {
      console.error('Failed to send invitation:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Có lỗi xảy ra khi gửi lời mời');
      }
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await travelCompanionApi.acceptInvitation({
        invitationId,
        relationship: 'friend' // Use valid enum value
      });
      message.success('Đã chấp nhận lời mời!');
      
      // Immediate refresh after accepting
      loadData();
    } catch (error: any) {
      console.error('Accept invitation failed:', error);
      message.error(error.response?.data?.message || 'Chấp nhận lời mời thất bại');
    }
  };

  const handleRemoveCompanion = async (companionId: string) => {
    try {
      await travelCompanionApi.removeCompanion(companionId);
      // Don't show message here, let WebSocket notification handle it
      
      // Refresh data after removal
      loadData();
    } catch (error: any) {
      console.error('Remove companion failed:', error);
      message.error(error.response?.data?.message || 'Xóa người đồng hành thất bại');
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      await travelCompanionApi.declineInvitation(invitationId);
      message.info('Đã từ chối lời mời');
      loadData(); // Reload data
    } catch (error: any) {
      console.error('Decline invitation failed:', error);
      message.error(error.response?.data?.message || 'Từ chối lời mời thất bại');
    }
  };

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case 'family': return <HeartOutlined style={{ color: '#f5222d' }} />;
      case 'friend': return <UserOutlined style={{ color: '#1890ff' }} />;
      case 'colleague': return <TeamOutlined style={{ color: '#52c41a' }} />;
      default: return <UserOutlined />;
    }
  };

  const getRelationshipText = (relationship: string) => {
    switch (relationship) {
      case 'family': return 'Gia đình';
      case 'friend': return 'Bạn bè';
      case 'colleague': return 'Đồng nghiệp';
      default: return 'Khác';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'green';
      case 'pending': return 'orange';
      case 'blocked': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Đã kết nối';
      case 'pending': return 'Chờ xác nhận';
      case 'blocked': return 'Đã chặn';
      default: return 'Không xác định';
    }
  };

  const getCurrentStatusBadge = (currentStatus: string) => {
    console.log('🔍 getCurrentStatusBadge called with status:', currentStatus);
    switch (currentStatus) {
      case 'online':
        return <Badge status="success" text="Đang trực tuyến" />;
      case 'traveling':
        return <Badge status="processing" text="Đang đi du lịch" />;
      case 'offline':
        return <Badge status="default" text="Ngoại tuyến" />;
      default:
        console.log('⚠️ Unknown status, defaulting to offline:', currentStatus);
        return <Badge status="default" text="Ngoại tuyến" />;
    }
  };

  const filteredCompanions = companions.filter(companion => {
    if (!companion.companion) {
      return false;
    }
    const companionName = `${companion.companion.firstName || ''} ${companion.companion.lastName || ''}`.toLowerCase();
    return companionName.includes(searchText.toLowerCase());
  });

  const tabItems: TabsProps['items'] = [
    {
      key: 'companions',
      label: (
        <span>
          <TeamOutlined style={{ marginRight: 8 }} />
          Người đồng hành ({companions.filter(c => c.status === 'connected').length})
        </span>
      ),
      children: (
        <List
          loading={loading}
          dataSource={filteredCompanions.filter(c => c.status === 'connected')}
          renderItem={(companion) => (
            <List.Item
              actions={[
                <Tooltip title="Nhắn tin" key="message">
                  <Button 
                    type="text" 
                    icon={<MessageOutlined />}
                    onClick={() => {
                      const name = companion.companion ? `${companion.companion.firstName || ''} ${companion.companion.lastName || ''}` : 'người dùng';
                      message.info(`Mở chat với ${name}`);
                    }}
                  />
                </Tooltip>,
                <Tooltip title="Mời tham gia chuyến đi" key="invite">
                  <Button 
                    type="text" 
                    icon={<CarOutlined />}
                    onClick={() => {
                      const name = companion.companion ? `${companion.companion.firstName || ''} ${companion.companion.lastName || ''}` : 'người dùng';
                      message.info(`Mời ${name} tham gia chuyến đi`);
                    }}
                  />
                </Tooltip>,
                <Tooltip title="Xem hồ sơ" key="profile">
                  <Button 
                    type="text" 
                    icon={<UserOutlined />}
                    onClick={() => {
                      const name = companion.companion ? `${companion.companion.firstName || ''} ${companion.companion.lastName || ''}` : 'người dùng';
                      message.info(`Xem hồ sơ của ${name}`);
                    }}
                  />
                </Tooltip>,
                <Popconfirm
                  key="delete"
                  title="Xóa người đồng hành"
                  description={`Bạn có chắc chắn muốn xóa ${companion.companion ? `${companion.companion.firstName || ''} ${companion.companion.lastName || ''}` : 'người dùng này'} khỏi danh sách đồng hành?`}
                  onConfirm={() => handleRemoveCompanion(companion.companionId)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okType="danger"
                >
                  <Tooltip title="Xóa người đồng hành">
                    <Button 
                      type="text" 
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Tooltip>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Badge 
                    dot={companion.currentStatus === 'online'}
                    status={companion.currentStatus === 'online' ? 'success' : 'default'}
                  >
                    <Avatar src={companion.companion?.avatar} icon={<UserOutlined />} size={48} />
                  </Badge>
                }
                title={
                  <Space>
                    <span style={{ fontWeight: 600 }}>
                      {companion.companion ? `${companion.companion.firstName || ''} ${companion.companion.lastName || ''}` : 'Người dùng'}
                    </span>
                    {getRelationshipIcon(companion.relationship)}
                    <Tag color={getStatusColor(companion.relationship)}>
                      {getRelationshipText(companion.relationship)}
                    </Tag>
                    <Tag color={companion.role === 'primary' ? 'gold' : 'blue'}>
                      {companion.role === 'primary' ? '👑 Người đặt chính' : '🤝 Người đồng hành'}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={4}>
                    <div>{getCurrentStatusBadge(companion.currentStatus)}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      🎯 {companion.sharedTrips} chuyến đã đi cùng
                    </Text>
                    {companion.lastTripDate && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        🗓️ Chuyến gần nhất: {new Date(companion.lastTripDate).toLocaleDateString('vi-VN')}
                      </Text>
                    )}
                    {companion.travelPreferences && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        ⚡ Mức hoạt động: {companion.travelPreferences.activityLevel}
                      </Text>
                    )}
                    {companion.aiPersonalNotes?.compatibilityScore && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        🤖 Độ tương thích AI: {companion.aiPersonalNotes.compatibilityScore}%
                      </Text>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có người đồng hành nào"
              />
            )
          }}
        />
      ),
    },
    {
      key: 'pending',
      label: (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          Lời mời ({pendingInvitations.length})
        </span>
      ),
      children: (
        <List
          loading={loading}
          dataSource={pendingInvitations}
          renderItem={(invitation) => (
            <List.Item
              actions={
                invitation.recipientId ? [ // If current user is recipient
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleAcceptInvitation(invitation.id)}
                    key="accept"
                  >
                    Chấp nhận
                  </Button>,
                  <Button
                    size="small"
                    icon={<StopOutlined />}
                    onClick={() => handleDeclineInvitation(invitation.id)}
                    key="decline"
                  >
                    Từ chối
                  </Button>,
                ] : [
                  <Text type="secondary" key="status">Chờ phản hồi</Text>
                ]
              }
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <Space>
                    <span style={{ fontWeight: 600 }}>
                      {invitation.recipientName || invitation.recipientEmail || 
                       (invitation.sender ? `${invitation.sender.firstName} ${invitation.sender.lastName}` : 'Người dùng')}
                    </span>
                    <Tag color={invitation.type === 'email' ? 'blue' : invitation.type === 'link' ? 'green' : 'orange'}>
                      {invitation.type === 'email' ? 'Email' : invitation.type === 'link' ? 'Link' : 'User ID'}
                    </Tag>
                    <Tag color="orange">Chờ xử lý</Tag>
                  </Space>
                }
                description={
                  <div>
                    {invitation.recipientEmail && (
                      <>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          📧 {invitation.recipientEmail}
                        </Text>
                        <br />
                      </>
                    )}
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      📅 Gửi lúc: {new Date(invitation.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                    {invitation.expiresAt && (
                      <>
                        <br />
                        <Text type="warning" style={{ fontSize: '12px' }}>
                          ⏰ Hết hạn: {new Date(invitation.expiresAt).toLocaleDateString('vi-VN')}
                        </Text>
                      </>
                    )}
                    {invitation.message && (
                      <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                        <Text style={{ fontSize: '12px' }}>"{invitation.message}"</Text>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có lời mời nào"
              />
            )
          }}
        />
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>
          🌍 Người đồng hành du lịch
        </Title>

        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="👑 Người đặt chính"
                value={stats.primaryTravelers}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="🤝 Người đồng hành"
                value={stats.companions}
                prefix={<Badge status="success" />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="⏳ Chờ xác nhận"
                value={stats.pending}
                prefix={<Badge status="warning" />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="🎯 Tổng chuyến đi"
                value={stats.totalTrips}
                prefix={<GlobalOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="🤖 Tương thích AI"
                value={stats.avgCompatibility}
                suffix="%"
                prefix={<RobotOutlined />}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="✅ Đã kết nối"
                value={stats.connected}
                prefix={<Badge status="success" />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Card */}
        <Card>
          {/* Header Controls */}
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Input.Search
              placeholder="Tìm kiếm người đồng hành..."
              style={{ width: 300 }}
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              enterButton={<SearchOutlined />}
            />

            <Space>
              <Button
                icon={<IdcardOutlined />}
                onClick={handleViewUserCode}
              >
                ID của tôi
              </Button>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={handleInviteCompanion}
              >
                Mời đồng hành
              </Button>
            </Space>
          </div>

          <Divider />

          {/* Tabs Content */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </Card>

        {/* Invite Companion Modal */}
        <Modal
          title={
            <span>
              <UserAddOutlined style={{ marginRight: 8 }} />
              Mời người đồng hành
            </span>
          }
          open={isInviteModalVisible}
          onOk={handleSendInvitation}
          onCancel={() => {
            setIsInviteModalVisible(false);
            form.resetFields();
          }}
          width={600}
          okText="Gửi lời mời"
          cancelText="Hủy"
          afterOpenChange={(open) => {
            if (open) {
              // Initialize form when modal opens
              form.setFieldsValue({
                inviteMethod: 'userCode',
                relationship: 'friend'
              });
            }
          }}
        >
          <Form form={form} layout="vertical">
            <Tabs 
              defaultActiveKey="userCode"
              onChange={(key) => {
                // Clear all fields and set new method
                form.resetFields();
                form.setFieldsValue({
                  inviteMethod: key,
                  relationship: 'friend' // Set default relationship for all tabs
                });
              }}
            >
              <Tabs.TabPane 
                tab={
                  <span>
                    <IdcardOutlined style={{ marginRight: 6 }} />
                    Bằng mã người dùng
                  </span>
                } 
                key="userCode"
              >
                <Form.Item
                  label="Mã người dùng"
                  name="userCode"
                >
                  <Input placeholder="Nhập mã người dùng (VD: TRV123456)" />
                </Form.Item>

                <Form.Item
                  label="Mối quan hệ"
                  name="relationship"
                >
                  <Select placeholder="Chọn mối quan hệ">
                    <Select.Option value="family">Gia đình</Select.Option>
                    <Select.Option value="friend">Bạn bè</Select.Option>
                    <Select.Option value="colleague">Đồng nghiệp</Select.Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  label="Tin nhắn"
                  name="message"
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Viết tin nhắn mời (tùy chọn)..."
                    maxLength={200}
                  />
                </Form.Item>
              </Tabs.TabPane>
              
              <Tabs.TabPane 
                tab={
                  <span>
                    <MailOutlined style={{ marginRight: 6 }} />
                    Gửi qua Email
                  </span>
                } 
                key="email"
              >
                <Form.Item
                  label="Email người nhận"
                  name="email"
                  rules={[
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input placeholder="Nhập email của người bạn muốn mời" />
                </Form.Item>

                <Form.Item
                  label="Mối quan hệ"
                  name="relationship"
                >
                  <Select placeholder="Chọn mối quan hệ">
                    <Select.Option value="family">Gia đình</Select.Option>
                    <Select.Option value="friend">Bạn bè</Select.Option>
                    <Select.Option value="colleague">Đồng nghiệp</Select.Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  label="Tin nhắn"
                  name="message"
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Viết tin nhắn mời (tùy chọn)..."
                    maxLength={200}
                  />
                </Form.Item>
              </Tabs.TabPane>
              
              <Tabs.TabPane 
                tab={
                  <span>
                    <LinkOutlined style={{ marginRight: 6 }} />
                    Link mời
                  </span>
                } 
                key="link"
              >
                <Form.Item
                  label="Mối quan hệ"
                  name="relationship"
                >
                  <Select placeholder="Chọn mối quan hệ">
                    <Select.Option value="family">Gia đình</Select.Option>
                    <Select.Option value="friend">Bạn bè</Select.Option>
                    <Select.Option value="colleague">Đồng nghiệp</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Tin nhắn"
                  name="message"
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Viết tin nhắn mời (tùy chọn)..."
                    maxLength={200}
                  />
                </Form.Item>

                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Text type="secondary">Link mời sẽ được tạo và copy vào clipboard sau khi nhấn "Gửi lời mời"</Text>
                </div>
              </Tabs.TabPane>

            </Tabs>
          </Form>
        </Modal>

        {/* User Code Modal */}
        <Modal
          title="Mã cá nhân của tôi"
          open={isViewingUserCode}
          onCancel={() => setIsViewingUserCode(false)}
          footer={[
            <Button 
              key="copy" 
              type="primary" 
              onClick={() => {
                navigator.clipboard.writeText(currentUserCode);
                message.success('Đã copy mã cá nhân!');
              }}
            >
              📋 Copy mã
            </Button>,
            <Button key="close" onClick={() => setIsViewingUserCode(false)}>
              Đóng
            </Button>,
          ]}
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Title level={4}>Mã cá nhân của bạn:</Title>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1890ff',
              padding: '16px',
              background: '#f0f6ff',
              borderRadius: 8,
              border: '2px dashed #1890ff',
              marginBottom: 16
            }}>
              {currentUserCode}
            </div>
            <Text type="secondary">
              Chia sẻ ID này với bạn bè để họ có thể gửi lời mời kết nối đồng hành du lịch với bạn.
            </Text>
          </div>
        </Modal>
      </div>
    </motion.div>
  );
};