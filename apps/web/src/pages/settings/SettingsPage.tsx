import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Typography, Divider, Switch, Button, Form, Input,
  Select, Slider, Space, Alert, Tabs, Descriptions, Tag, Modal,
  notification, Radio
} from 'antd';
import {
  SettingOutlined, SecurityScanOutlined, BellOutlined, UserOutlined,
  BgColorsOutlined, GlobalOutlined, SafetyCertificateOutlined, LockOutlined,
  DeleteOutlined, ExclamationCircleOutlined, EyeOutlined, ApiOutlined,
  QrcodeOutlined, CheckCircleOutlined, LoadingOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { confirm } = Modal;

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);

  // Settings states
  const [settings, setSettings] = useState({
    // Account Settings
    language: 'en',
    timezone: 'UTC+7',
    currency: 'USD',

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    tripReminders: true,
    marketingEmails: false,
    weeklyDigest: true,

    // Privacy Settings
    profileVisibility: 'private',
    showEmail: false,
    showPhone: false,
    allowContactFromAgents: true,

    // Display Settings
    compactMode: false,
    showTutorials: true,
    autoSave: true,

    // Security Settings
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: 30
  });

  // Zalo Integration states
  const [zaloIntegration, setZaloIntegration] = useState({
    isConnected: false,
    isConnecting: false,
    qrCode: null,
    accountInfo: null
  });

  // QR Modal state
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Account Details Modal state
  const [accountDetailsVisible, setAccountDetailsVisible] = useState(false);
  const [accountDetails, setAccountDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));

    // Show success notification
    notification.success({
      message: 'Cài đặt đã cập nhật',
      description: 'Cài đặt của bạn đã được lưu thành công.',
      duration: 2
    });
  };

  const handleDeleteAccount = () => {
    confirm({
      title: 'Xóa tài khoản',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <Paragraph>
            Bạn có chắc chắn muốn xóa tài khoản không? Hành động này không thể hoàn tác.
          </Paragraph>
          <Alert
            message="Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn"
            description="Bao gồm hồ sơ, lịch sử chuyến đi, tùy chọn và tất cả dữ liệu liên quan."
            type="error"
            showIcon
          />
        </div>
      ),
      okText: 'Xóa tài khoản',
      okType: 'danger',
      cancelText: 'Hủy bỏ',
      onOk() {
        console.log('Account deletion confirmed');
        notification.error({
          message: 'Xóa tài khoản',
          description: 'Tính năng xóa tài khoản chưa được triển khai.'
        });
      },
    });
  };

  const handleExportData = () => {
    setLoading(true);
    // Simulate export process
    setTimeout(() => {
      setLoading(false);
      notification.success({
        message: 'Xuất dữ liệu',
        description: 'Dữ liệu của bạn đã được xuất thành công. Tải xuống sẽ bắt đầu ngay.'
      });
    }, 2000);
  };

  // Zalo Integration handlers
  const handleZaloLogin = async () => {
    setZaloIntegration(prev => ({ ...prev, isConnecting: true, qrCode: null }));
    setQrModalVisible(true);

    try {
      // Call AI Service Zalo API to generate QR code
      const response = await fetch('http://localhost:3005/api/v1/zalo/login-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: user?.id || 'default'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      // Poll for QR code and status
      await pollZaloStatus();

    } catch (error) {
      console.error('Zalo connection error:', error);
      notification.error({
        message: 'Kết nối thất bại',
        description: 'Không thể kết nối với Zalo. Vui lòng thử lại.'
      });
      setZaloIntegration(prev => ({ ...prev, isConnecting: false }));
      setQrModalVisible(false);
    }
  };

  const pollZaloStatus = async () => {
    const accountId = user?.id || 'default';

    // Clear any existing interval
    if (pollInterval) {
      clearInterval(pollInterval);
    }

    const newPollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:3005/api/v1/zalo/login-status/${accountId}`);
        const data = await response.json();

        if (data.success && data.session) {
          const { status, qrCode, error } = data.session;

          setZaloIntegration(prev => ({
            ...prev,
            qrCode: qrCode,
          }));

          if (status === 'success') {
            // Connection successful
            clearInterval(newPollInterval);
            setPollInterval(null);
            setZaloIntegration(prev => ({
              ...prev,
              isConnected: true,
              isConnecting: false,
              qrCode: null,
              accountInfo: data.session.accountInfo || { name: 'Zalo User' }
            }));

            setQrModalVisible(false);

            notification.success({
              message: 'Kết nối Zalo thành công',
              description: 'Tài khoản Zalo của bạn đã được kết nối thành công!'
            });
          } else if (status === 'error' || status === 'expired') {
            // Connection failed
            clearInterval(newPollInterval);
            setPollInterval(null);
            setZaloIntegration(prev => ({
              ...prev,
              isConnecting: false,
              qrCode: null
            }));

            setQrModalVisible(false);

            notification.error({
              message: 'Kết nối thất bại',
              description: error || 'Mã QR đã hết hạn. Vui lòng thử lại.'
            });
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Store the interval reference
    setPollInterval(newPollInterval);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(newPollInterval);
      setPollInterval(null);
      if (zaloIntegration.isConnecting) {
        setZaloIntegration(prev => ({
          ...prev,
          isConnecting: false,
          qrCode: null
        }));
        setQrModalVisible(false);
        notification.warning({
          message: 'Hết thời gian kết nối',
          description: 'Mã QR đã hết hạn. Vui lòng thử lại.'
        });
      }
    }, 5 * 60 * 1000);
  };

  const handleZaloDisconnect = () => {
    confirm({
      title: 'Ngắt kết nối Zalo',
      content: 'Bạn có chắc chắn muốn ngắt kết nối tài khoản Zalo không?',
      onOk() {
        setZaloIntegration({
          isConnected: false,
          isConnecting: false,
          qrCode: null,
          accountInfo: null
        });

        notification.success({
          message: 'Ngắt kết nối Zalo',
          description: 'Tài khoản Zalo của bạn đã bị ngắt kết nối.'
        });
      },
    });
  };

  const handleShowAccountDetails = async () => {
    setLoadingDetails(true);
    setAccountDetailsVisible(true);

    try {
      const accountId = user?.id || 'default';
      const response = await fetch(`http://localhost:3005/api/v1/zalo/account-info/${accountId}`);
      const data = await response.json();

      if (data.success) {
        setAccountDetails(data);
      } else {
        throw new Error(data.error || 'Failed to fetch account info');
      }

    } catch (error) {
      console.error('Failed to fetch account details:', error);
      notification.error({
        message: 'Không thể tải chi tiết',
        description: 'Không thể lấy thông tin tài khoản. Vui lòng thử lại.'
      });
      setAccountDetailsVisible(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Auto-restore Zalo session on component mount
  const checkExistingZaloSession = async () => {
    try {
      const accountId = user?.id || 'default';
      const response = await fetch(`http://localhost:3005/api/v1/zalo/auto-restore/${accountId}`);
      const data = await response.json();

      if (data.success && data.connected) {
        setZaloIntegration({
          isConnected: true,
          isConnecting: false,
          qrCode: null,
          accountInfo: data.accountInfo
        });

        console.log('✅ Zalo session restored:', data.accountInfo?.name);
      }

    } catch (error) {
      console.log('No existing Zalo session found');
    }
  };

  useEffect(() => {
    if (user?.id) {
      checkExistingZaloSession();
    }
  }, [user?.id]);

  const accountTab = (
    <Card>
      <Title level={4}>
        <UserOutlined /> Thông tin tài khoản
      </Title>
      <Descriptions column={1} bordered style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Tên">
          {user?.firstName} {user?.lastName}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {user?.email}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái tài khoản">
          <Tag color="green">Hoạt động</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Thành viên từ">
          Tháng 9 năm 2025
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Title level={5}>Cài đặt khu vực</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Form.Item label="Ngôn ngữ">
            <Select
              value={settings.language}
              onChange={(value) => handleSettingChange('language', value)}
              style={{ width: '100%' }}
            >
              <Option value="en">English</Option>
              <Option value="vi">Tiếng Việt</Option>
              <Option value="fr">Français</Option>
              <Option value="es">Español</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Múi giờ">
            <Select
              value={settings.timezone}
              onChange={(value) => handleSettingChange('timezone', value)}
              style={{ width: '100%' }}
            >
              <Option value="UTC+7">UTC+7 (Việt Nam)</Option>
              <Option value="UTC+0">UTC+0 (GMT)</Option>
              <Option value="UTC-5">UTC-5 (EST)</Option>
              <Option value="UTC-8">UTC-8 (PST)</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Tiền tệ">
            <Select
              value={settings.currency}
              onChange={(value) => handleSettingChange('currency', value)}
              style={{ width: '100%' }}
            >
              <Option value="USD">USD ($)</Option>
              <Option value="VND">VND (₫)</Option>
              <Option value="EUR">EUR (€)</Option>
              <Option value="GBP">GBP (£)</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const notificationTab = (
    <Card>
      <Title level={4}>
        <BellOutlined /> Tùy chỉnh thông báo
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card size="small" title="Thông báo qua Email">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Thông báo email tổng quát</Text>
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Nhắc nhở chuyến đi</Text>
                <Switch
                  checked={settings.tripReminders}
                  onChange={(checked) => handleSettingChange('tripReminders', checked)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Bản tin hàng tuần</Text>
                <Switch
                  checked={settings.weeklyDigest}
                  onChange={(checked) => handleSettingChange('weeklyDigest', checked)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Email quảng cáo</Text>
                <Switch
                  checked={settings.marketingEmails}
                  onChange={(checked) => handleSettingChange('marketingEmails', checked)}
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small" title="Thông báo đẩy">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Thông báo đẩy</Text>
                <Switch
                  checked={settings.pushNotifications}
                  onChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>
              <Alert
                message="Thông báo trình duyệt cần quyền"
                description="Bật thông báo trình duyệt để nhận cập nhật theo thời gian thực."
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  const privacyTab = (
    <Card>
      <Title level={4}>
        <SafetyCertificateOutlined /> Bảo mật & Riêng tư
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card size="small" title="Hiển thị hồ sơ">
            <Form.Item label="Mức độ hiển thị hồ sơ">
              <Radio.Group
                value={settings.profileVisibility}
                onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
              >
                <Radio.Button value="public">Công khai</Radio.Button>
                <Radio.Button value="private">Riêng tư</Radio.Button>
                <Radio.Button value="friends">Chỉ bạn bè</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Hiển thị địa chỉ email</Text>
                <Switch
                  checked={settings.showEmail}
                  onChange={(checked) => handleSettingChange('showEmail', checked)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Hiển thị số điện thoại</Text>
                <Switch
                  checked={settings.showPhone}
                  onChange={(checked) => handleSettingChange('showPhone', checked)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Cho phép liên hệ từ đại lý du lịch</Text>
                <Switch
                  checked={settings.allowContactFromAgents}
                  onChange={(checked) => handleSettingChange('allowContactFromAgents', checked)}
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small" title="Cài đặt bảo mật">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text>Xác thực hai yếu tố</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Thêm một lớp bảo vệ bổ sung
                  </Text>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Thông báo đăng nhập</Text>
                <Switch
                  checked={settings.loginNotifications}
                  onChange={(checked) => handleSettingChange('loginNotifications', checked)}
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <Text>Thời gian chờ phiên (phút)</Text>
                <Slider
                  min={15}
                  max={120}
                  step={15}
                  value={settings.sessionTimeout}
                  onChange={(value) => handleSettingChange('sessionTimeout', value)}
                  marks={{ 15: '15p', 30: '30p', 60: '1h', 120: '2h' }}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  const appearanceTab = (
    <Card>
      <Title level={4}>
        <BgColorsOutlined /> Giao diện & Hiển thị
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card size="small" title="Cài đặt giao diện">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text>Chế độ tối</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Chuyển đổi giữa giao diện sáng và tối
                  </Text>
                </div>
                <Switch
                  checked={isDark}
                  onChange={toggleTheme}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Chế độ gọn</Text>
                <Switch
                  checked={settings.compactMode}
                  onChange={(checked) => handleSettingChange('compactMode', checked)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Hiển thị hướng dẫn</Text>
                <Switch
                  checked={settings.showTutorials}
                  onChange={(checked) => handleSettingChange('showTutorials', checked)}
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small" title="Cài đặt hành vi">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text>Tự động lưu</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Tự động lưu dữ liệu form
                  </Text>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onChange={(checked) => handleSettingChange('autoSave', checked)}
                />
              </div>

              <Alert
                message="Xem trước giao diện sắp ra mắt"
                description="Nhiều tùy chọn giao diện và tùy chỉnh sẽ có trong các bản cập nhật tương lai."
                type="info"
                showIcon
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  const dataTab = (
    <Card>
      <Title level={4}>
        <GlobalOutlined /> Dữ liệu & Riêng tư
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card size="small" title="Quản lý dữ liệu">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                icon={<EyeOutlined />}
                onClick={handleExportData}
                loading={loading}
                block
              >
                Xuất dữ liệu của tôi
              </Button>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Tải xuống tất cả dữ liệu cá nhân của bạn ở định dạng JSON
              </Text>

              <Divider />

              <Alert
                message="Chính sách lưu trữ dữ liệu"
                description="Dữ liệu của bạn được lưu trữ an toàn và chỉ được sử dụng để cung cấp dịch vụ của chúng tôi. Chúng tôi không bao giờ bán thông tin cá nhân của bạn."
                type="info"
                showIcon
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small" title="Khu vực nguy hiểm">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="Xóa tài khoản"
                description="Khi bạn xóa tài khoản, sẽ không thể hoàn tác. Hãy chắc chắn trước khi thực hiện."
                type="error"
                showIcon
              />

              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteAccount}
                block
              >
                Xóa tài khoản của tôi
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  const integrationsTab = (
    <Card>
      <Title level={4}>
        <ApiOutlined /> Tích hợp
      </Title>
      <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
        Kết nối các ứng dụng và dịch vụ yêu thích để nâng cao trải nghiệm du lịch của bạn
      </Text>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card
            size="small"
            title={
              <Space>
                <img
                  src="https://page.widget.zalo.me/static/images/2.0/Logo.svg"
                  alt="Zalo"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8
                  }}
                />
                Tích hợp Zalo
              </Space>
            }
            extra={
              zaloIntegration.isConnected ? (
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  Đã kết nối
                </Tag>
              ) : (
                <Tag color="default">
                  Chưa kết nối
                </Tag>
              )
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">
                Kết nối tài khoản Zalo của bạn để bật đặt chỗ liền mạch qua chat Zalo
              </Text>

              {zaloIntegration.isConnected ? (
                <div>
                  <Text strong>Tài khoản: </Text>
                  <Text>{zaloIntegration.accountInfo?.name || 'Người dùng Zalo'}</Text>
                  <br />
                  <Space style={{ marginTop: 8 }}>
                    <Button
                      size="small"
                      onClick={handleShowAccountDetails}
                    >
                      Chi tiết
                    </Button>
                    <Button
                      danger
                      size="small"
                      onClick={handleZaloDisconnect}
                    >
                      Ngắt kết nối
                    </Button>
                  </Space>
                </div>
              ) : (
                <div>
                  <Button
                    type="primary"
                    icon={<QrcodeOutlined />}
                    onClick={handleZaloLogin}
                    style={{ marginTop: 8 }}
                  >
                    Kết nối Zalo
                  </Button>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small" title="Các tích hợp khác">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="Sắp ra mắt"
                description="Nhiều tích hợp với các dịch vụ du lịch phổ biến sẽ sớm có sẵn."
                type="info"
                showIcon
              />

              <Text type="secondary">
                Các tích hợp tương lai có thể bao gồm:
              </Text>
              <ul style={{ marginLeft: 16, marginTop: 8 }}>
                <li><Text type="secondary">Google Calendar</Text></li>
                <li><Text type="secondary">WhatsApp Business</Text></li>
                <li><Text type="secondary">Telegram</Text></li>
                <li><Text type="secondary">Facebook Messenger</Text></li>
              </ul>
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div style={{ padding: '24px', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <SettingOutlined /> Cài đặt
        </Title>
        <Text type="secondary">
          Quản lý cài đặt tài khoản và tùy chọn của bạn
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'account',
            label: (
              <span>
                <UserOutlined style={{ marginRight: 8 }} />
                Tài khoản
              </span>
            ),
            children: accountTab,
          },
          {
            key: 'notifications',
            label: (
              <span>
                <BellOutlined style={{ marginRight: 8 }} />
                Thông báo
              </span>
            ),
            children: notificationTab,
          },
          {
            key: 'privacy',
            label: (
              <span>
                <SafetyCertificateOutlined style={{ marginRight: 8 }} />
                Bảo mật & Riêng tư
              </span>
            ),
            children: privacyTab,
          },
          {
            key: 'appearance',
            label: (
              <span>
                <BgColorsOutlined style={{ marginRight: 8 }} />
                Giao diện
              </span>
            ),
            children: appearanceTab,
          },
          {
            key: 'integrations',
            label: (
              <span>
                <ApiOutlined style={{ marginRight: 8 }} />
                Tích hợp
              </span>
            ),
            children: integrationsTab,
          },
          {
            key: 'data',
            label: (
              <span>
                <GlobalOutlined style={{ marginRight: 8 }} />
                Dữ liệu & Riêng tư
              </span>
            ),
            children: dataTab,
          },
        ]}
      />

      {/* Zalo QR Code Modal */}
      <Modal
        title={
          <Space>
            <img
              src="https://page.widget.zalo.me/static/images/2.0/Logo.svg"
              alt="Zalo"
              style={{ width: 24, height: 24 }}
            />
            Kết nối tài khoản Zalo
          </Space>
        }
        open={qrModalVisible}
        onCancel={() => {
          // Clear polling interval
          if (pollInterval) {
            clearInterval(pollInterval);
            setPollInterval(null);
          }

          setQrModalVisible(false);
          setZaloIntegration(prev => ({
            ...prev,
            isConnecting: false,
            qrCode: null
          }));
        }}
        footer={null}
        width={400}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          {zaloIntegration.isConnecting && !zaloIntegration.qrCode ? (
            <div>
              <LoadingOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
              <div>
                <Text strong>Đang tạo mã QR...</Text>
                <br />
                <Text type="secondary">Vui lòng đợi một chút</Text>
              </div>
            </div>
          ) : zaloIntegration.qrCode ? (
            <div>
              <Text strong style={{ fontSize: 16, marginBottom: 16, display: 'block' }}>
                Quét mã QR bằng ứng dụng Zalo
              </Text>

              <div style={{
                marginBottom: 16,
                padding: 16,
                border: '2px solid #f0f0f0',
                borderRadius: 12,
                background: 'white',
                display: 'inline-block'
              }}>
                <img
                  src={`data:image/png;base64,${zaloIntegration.qrCode}`}
                  alt="Zalo QR Code"
                  style={{ width: 200, height: 200, display: 'block' }}
                />
              </div>

              <div style={{ color: '#666' }}>
                <Text type="secondary">
                  1. Mở ứng dụng Zalo trên điện thoại
                </Text>
                <br />
                <Text type="secondary">
                  2. Chạm vào biểu tượng quét QR
                </Text>
                <br />
                <Text type="secondary">
                  3. Quét mã QR này để kết nối
                </Text>
              </div>
            </div>
          ) : (
            <div>
              <Text type="danger">Không thể tạo mã QR</Text>
            </div>
          )}
        </div>
      </Modal>

      {/* Zalo Account Details Modal */}
      <Modal
        title={
          <Space>
            <img
              src="https://page.widget.zalo.me/static/images/2.0/Logo.svg"
              alt="Zalo"
              style={{ width: 24, height: 24 }}
            />
            Thông tin tài khoản Zalo
          </Space>
        }
        open={accountDetailsVisible}
        onCancel={() => {
          setAccountDetailsVisible(false);
          setAccountDetails(null);
        }}
        footer={[
          <Button key="close" onClick={() => setAccountDetailsVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {loadingDetails ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <LoadingOutlined style={{ fontSize: 24, marginBottom: 16 }} />
            <div>Đang tải thông tin...</div>
          </div>
        ) : accountDetails ? (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Tên tài khoản">
                <Text strong>{accountDetails.accountInfo?.name || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="User ID">
                <Text code>{user?.id || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian đăng nhập">
                <Text>{accountDetails.accountInfo?.loginTime ?
                  new Date(accountDetails.accountInfo.loginTime).toLocaleString('vi-VN')
                  : 'N/A'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="IMEI">
                <Text code style={{ fontSize: '11px' }}>
                  {accountDetails.accountInfo?.imei || 'N/A'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="User Agent">
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {accountDetails.accountInfo?.userAgent || 'N/A'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái kết nối">
                <Tag color="green">Đã kết nối</Tag>
              </Descriptions.Item>
            </Descriptions>



            <div style={{ marginTop: 16 }}>
              <Title level={5}>Thông tin kỹ thuật:</Title>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Có Cookie">
                  <Tag color={accountDetails.rawCredentials?.hasCookie ? 'green' : 'red'}>
                    {accountDetails.rawCredentials?.hasCookie ? 'Có' : 'Không'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Số Cookie">
                  <Text>{accountDetails.rawCredentials?.cookieCount || 0}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Có IMEI">
                  <Tag color={accountDetails.rawCredentials?.hasImei ? 'green' : 'red'}>
                    {accountDetails.rawCredentials?.hasImei ? 'Có' : 'Không'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Login Timestamp">
                  <Text>{accountDetails.rawCredentials?.loginTimestamp || 'N/A'}</Text>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">Không có thông tin để hiển thị</Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SettingsPage;