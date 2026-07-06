import React from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Progress,
  List,
  Avatar,
  Tag,
  Button,
} from 'antd';
import {
  UserOutlined,
  CarOutlined,
  DollarOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  EditOutlined,
  MessageOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const statsData = [
    {
      title: 'Total Users',
      value: 1234,
      prefix: <UserOutlined />,
      suffix: '',
      trend: 12.5,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.1)',
    },
    {
      title: 'Active Trips',
      value: 89,
      prefix: <CarOutlined />,
      suffix: '',
      trend: -2.3,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
    {
      title: 'Revenue',
      value: 52840,
      prefix: <DollarOutlined />,
      suffix: '$',
      trend: 8.7,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
      title: 'Satisfaction',
      value: 98.2,
      prefix: <TrophyOutlined />,
      suffix: '%',
      trend: 1.2,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: 'John Smith',
      action: 'Created new trip',
      target: 'Tokyo Adventure',
      time: '2 minutes ago',
      avatar: null, // Remove avatar path
      type: 'create',
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      action: 'Updated profile',
      target: 'Personal Information',
      time: '5 minutes ago',
      avatar: null, // Remove avatar path
      type: 'update',
    },
    {
      id: 3,
      user: 'Mike Wilson',
      action: 'Completed trip',
      target: 'Paris Explorer',
      time: '1 hour ago',
      avatar: null, // Remove avatar path
      type: 'complete',
    },
    {
      id: 4,
      user: 'Emma Davis',
      action: 'Joined platform',
      target: 'New Registration',
      time: '2 hours ago',
      avatar: null, // Remove avatar path
      type: 'join',
    },
  ];

  const popularTrips = [
    {
      id: 1,
      name: 'Tokyo Adventure',
      bookings: 156,
      revenue: 12400,
      rating: 4.8,
      image: '/trips/tokyo.jpg',
    },
    {
      id: 2,
      name: 'Paris Explorer',
      bookings: 134,
      revenue: 10800,
      rating: 4.9,
      image: '/trips/paris.jpg',
    },
    {
      id: 3,
      name: 'New York City',
      bookings: 128,
      revenue: 9600,
      rating: 4.7,
      image: '/trips/nyc.jpg',
    },
    {
      id: 4,
      name: 'London Heritage',
      bookings: 98,
      revenue: 8200,
      rating: 4.6,
      image: '/trips/london.jpg',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: '0' }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
          <span className="gradient-text">Dashboard Overview</span>
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Welcome back! Here's what's happening with your travel agency.
        </Text>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div variants={itemVariants}>
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          {statsData.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="shadow-hover"
                  style={{
                    borderRadius: 16,
                    border: 'none',
                    background: isDark ? '#1e293b' : '#ffffff',
                  }}
                  styles={{ body: { padding: 24 } }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: stat.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                          color: stat.color,
                        }}
                      >
                        {stat.prefix}
                      </div>
                      <Tag
                        color={stat.trend > 0 ? 'success' : 'error'}
                        icon={stat.trend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        style={{ border: 'none', borderRadius: 8 }}
                      >
                        {Math.abs(stat.trend)}%
                      </Tag>
                    </div>
                    <div>
                      <Statistic
                        title={stat.title}
                        value={stat.value}
                        suffix={stat.suffix}
                        valueStyle={{
                          color: isDark ? '#f1f5f9' : '#1f2937',
                          fontSize: 24,
                          fontWeight: 700,
                        }}
                      />
                    </div>
                  </Space>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Main Content Row */}
      <Row gutter={[24, 24]}>
        {/* Recent Activities */}
        <Col xs={24} lg={14}>
          <motion.div variants={itemVariants}>
            <Card
              title={
                <Space>
                  <Title level={4} style={{ margin: 0 }}>
                    Recent Activities
                  </Title>
                  <Tag color="processing">Live</Tag>
                </Space>
              }
              extra={
                <Button type="text" icon={<EyeOutlined />}>
                  View All
                </Button>
              }
              className="shadow-hover"
              style={{
                borderRadius: 16,
                border: 'none',
                background: isDark ? '#1e293b' : '#ffffff',
                height: '100%',
              }}
            >
              <List
                dataSource={recentActivities}
                renderItem={(item) => (
                  <List.Item style={{ border: 'none', padding: '12px 0' }}>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          }}
                        >
                          {item.user.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                      }
                      title={
                        <Space>
                          <Text strong>{item.user}</Text>
                          <Text type="secondary">{item.action}</Text>
                          <Text style={{ color: '#6366f1' }}>{item.target}</Text>
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.time}
                        </Text>
                      }
                    />
                    <Tag
                      color={
                        item.type === 'create'
                          ? 'blue'
                          : item.type === 'update'
                          ? 'orange'
                          : item.type === 'complete'
                          ? 'green'
                          : 'purple'
                      }
                      style={{ borderRadius: 8 }}
                    >
                      {item.type}
                    </Tag>
                  </List.Item>
                )}
              />
            </Card>
          </motion.div>
        </Col>

        {/* Popular Trips */}
        <Col xs={24} lg={10}>
          <motion.div variants={itemVariants}>
            <Card
              title={
                <Title level={4} style={{ margin: 0 }}>
                  Popular Trips
                </Title>
              }
              extra={
                <Button type="text" icon={<EditOutlined />}>
                  Manage
                </Button>
              }
              className="shadow-hover"
              style={{
                borderRadius: 16,
                border: 'none',
                background: isDark ? '#1e293b' : '#ffffff',
                height: '100%',
              }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {popularTrips.map((trip, index) => (
                  <motion.div
                    key={trip.id}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    }}
                  >
                    <Row align="middle" gutter={12}>
                      <Col>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            background: `linear-gradient(135deg, hsl(${index * 60}, 70%, 60%) 0%, hsl(${index * 60 + 30}, 70%, 70%) 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        >
                          {trip.name.charAt(0)}
                        </div>
                      </Col>
                      <Col flex={1}>
                        <div>
                          <Text strong style={{ display: 'block', marginBottom: 4 }}>
                            {trip.name}
                          </Text>
                          <Space size="small">
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {trip.bookings} bookings
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              •
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              ${trip.revenue}
                            </Text>
                          </Space>
                        </div>
                      </Col>
                      <Col>
                        <Space direction="vertical" size={0} align="end">
                          <Text strong style={{ color: '#10b981' }}>
                            ⭐ {trip.rating}
                          </Text>
                          <Progress
                            percent={(trip.bookings / 200) * 100}
                            size="small"
                            showInfo={false}
                            strokeColor="#6366f1"
                            style={{ width: 60 }}
                          />
                        </Space>
                      </Col>
                    </Row>
                  </motion.div>
                ))}
              </Space>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
};

export default Dashboard;