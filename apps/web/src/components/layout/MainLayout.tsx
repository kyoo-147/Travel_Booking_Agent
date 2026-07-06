import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Badge,
  Space,
  Typography,
  Tooltip,
  Drawer,
  Popconfirm,
  theme as antdTheme,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  TeamOutlined,
  CarOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  MessageOutlined,
  SearchOutlined,
  HeartOutlined,
  CalendarOutlined,
  HistoryOutlined,
  PlusOutlined,
  QrcodeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from '../NotificationBell';
import { chatService, ChatSession } from '../../services/chat.service';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  {
    key: 'chat',
    icon: <MessageOutlined />,
    label: 'Agent',
    path: '/chat',
  },
  {
    key: 'zalo-connect',
    icon: <QrcodeOutlined />,
    label: 'Kênh Zalo',
    path: '/zalo-connect',
  },
  {
    key: 'trips',
    icon: <CarOutlined />,
    label: 'Chuyến đi của tôi',
    path: '/trips',
  },
  {
    key: 'users',
    icon: <TeamOutlined />,
    label: 'Bạn đồng hành',
    path: '/users',
  },
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: 'Hồ sơ cá nhân',
    path: '/profile',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Cài đặt',
    path: '/settings',
  },
];

export const MainLayout: React.FC = () => {
  // Read collapsed state from localStorage, default to false
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [chatHistoryDrawerOpen, setChatHistoryDrawerOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  const { theme, toggleTheme, isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = antdTheme.useToken();

  useEffect(() => {
    if (chatHistoryDrawerOpen && user?.id) {
      chatService.getUserSessions(user.id).then(setChatSessions).catch(console.error);
    }
  }, [chatHistoryDrawerOpen, user?.id]);

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const currentPath = location.pathname;
  // Fix bug: Tạo copy để sort mà không ảnh hưởng thứ tự menu gốc
  const selectedKey = [...menuItems]
    .sort((a, b) => b.path.length - a.path.length) // Paths dài hơn trước khi tìm match
    .find(item => currentPath.startsWith(item.path))?.key || 'dashboard';

  const handleMenuClick = (key: string) => {
    const item = menuItems.find(item => item.key === key);
    if (item) {
      navigate(item.path);
    }
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('auth_tokens');
    // Redirect to login
    navigate('/login');
  };

  const handleNewChat = () => {
    setChatHistoryDrawerOpen(false);
    navigate('/chat', { state: { newChat: true, t: Date.now() } });
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={256}
        collapsedWidth={80}
        style={{
          background: isDark ? '#1e293b' : '#ffffff',
          borderRight: `1px solid ${isDark ? '#334155' : '#f0f0f0'}`,
          boxShadow: '2px 0 8px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Logo */}
        <motion.div
          initial={false}
          animate={{
            padding: collapsed ? '16px 10px' : '16px 24px',
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderBottom: `1px solid ${isDark ? '#334155' : '#f0f0f0'}`,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src="/logo-removebg.png" alt="GoJourney Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                style={{ marginLeft: 12, overflow: 'hidden' }}
              >
                <Text
                  strong
                  style={{
                    fontSize: 18,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    whiteSpace: 'nowrap',
                  }}
                >
                  GoJourney
                </Text>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation Menu */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '0 16px',
          }}
          items={menuItems.map(item => ({
            key: item.key,
            icon: (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.icon}
              </motion.div>
            ),
            label: (
              <motion.span
                initial={false}
                animate={{
                  opacity: collapsed ? 0 : 1,
                }}
                style={{ fontWeight: 500 }}
              >
                {item.label}
              </motion.span>
            ),
            onClick: () => handleMenuClick(item.key),
          }))}
        />

        {/* Chat Quick Actions - Removed as per user request */}
      </Sider>

      {/* Main Content Area */}
      <Layout>
        {/* Header */}
        <Header
          style={{
            background: isDark ? '#1e293b' : '#ffffff',
            padding: '0 24px',
            borderBottom: `1px solid ${isDark ? '#334155' : '#f0f0f0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Left side - Collapse button */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: 16,
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />

          {/* Right side - User actions */}
          <Space size="middle">
            {/* Theme toggle */}
            <Tooltip title={isDark ? 'Chuyển qua chế độ Sáng' : 'Chuyển qua chế độ Tối'}>
              <Button
                type="text"
                icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleTheme}
                style={{
                  fontSize: 16,
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            </Tooltip>

            {/* New Chat */}
            <Tooltip title="Cuộc trò chuyện mới">
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={handleNewChat}
                style={{
                  color: isDark ? token.colorTextSecondary : token.colorText,
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            </Tooltip>

            {/* Chat History */}
            <Tooltip title="Lịch sử chat" placement="bottom">
              <Button
                type="text"
                icon={<HistoryOutlined />}
                onClick={() => setChatHistoryDrawerOpen(true)}
                style={{
                  color: isDark ? token.colorTextSecondary : token.colorText,
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            </Tooltip>



            {/* Notifications */}
            <NotificationBell />

            {/* User dropdown */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Space
                style={{
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 8,
                  transition: 'background-color 0.2s',
                }}
                className="hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <Avatar
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  }}
                  icon={<UserOutlined />}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text strong style={{ fontSize: 14, lineHeight: 1.2 }}>
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || 'User'}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.2 }}>
                    Administrator
                  </Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: 24,
            minHeight: 'calc(100vh - 112px)',
            background: 'transparent',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%' }}
          >
            <Outlet />
          </motion.div>
        </Content>
      </Layout>

      {/* Chat History Drawer */}
      <Drawer
        title="Lịch sử Chat"
        placement="right"
        onClose={() => setChatHistoryDrawerOpen(false)}
        open={chatHistoryDrawerOpen}
        width={400}
        styles={{ body: { padding: '16px' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={handleNewChat}
            style={{ marginBottom: 8, height: 40 }}
          >
            Cuộc trò chuyện mới
          </Button>


          {/* Mock chat history data */}
          {chatSessions.length > 0 ? chatSessions.map((chat) => (
            <div
              key={chat.id}
              className="chat-session-item" // Add class for hover styling
              style={{
                position: 'relative', // For absolute positioning of delete button
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
                background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                // Show delete button
                const deleteBtn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                if (deleteBtn) deleteBtn.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = 'none';
                // Hide delete button
                const deleteBtn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                if (deleteBtn) deleteBtn.style.opacity = '0';
              }}
              onClick={() => {
                setChatHistoryDrawerOpen(false);
                navigate(`/chat/${chat.id}`);
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <Text strong style={{
                  fontSize: '14px',
                  color: isDark ? token.colorText : token.colorText,
                  lineHeight: '1.4',
                  maxWidth: '85%', // Reduce width to make space for delete button
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {chat.title || 'Cuộc trò chuyện mới'}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{
                  fontSize: '11px',
                }}>
                  {new Date(chat.updatedAt).toLocaleDateString('vi-VN')}
                </Text>

                {/* Delete Button */}
                <Popconfirm
                  title="Xóa cuộc trò chuyện này?"
                  description="Hành động này không thể hoàn tác"
                  onConfirm={(e: any) => {
                    e?.stopPropagation();
                    if (user?.id) {
                      chatService.deleteSession(chat.id, user.id).then(() => {
                        setChatSessions(prev => prev.filter(s => s.id !== chat.id));
                      }).catch(err => console.error(err));
                    }
                  }}
                  onCancel={(e: any) => e?.stopPropagation()}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button
                    className="delete-btn"
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    style={{
                      opacity: 0, // Hidden by default
                      transition: 'opacity 0.2s',
                    }}
                  />
                </Popconfirm>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '20px', color: isDark ? '#9ca3af' : '#6b7280' }}>
              Chưa có lịch sử trò chuyện
            </div>
          )}
        </div>
      </Drawer>
    </Layout>
  );
};