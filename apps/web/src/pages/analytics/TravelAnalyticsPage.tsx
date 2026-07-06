import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Space,
  List,
  Avatar,
  Tag,
  Tooltip,
  Button,
  DatePicker,
  Select,
  Table,
  Badge,
  Timeline,
} from 'antd';
import {
  TrophyOutlined,
  GlobalOutlined,
  DollarOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  StarOutlined,
  RiseOutlined,
  FallOutlined,
  HeartOutlined,
  ClockCircleOutlined,
  FireOutlined,
  CarOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Line, Pie, Column } from '@ant-design/plots';
import dayjs from 'dayjs';
import { analyticsService, TravelAnalytics, TravelPattern } from '../../services/analytics.service';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export const TravelAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<TravelAnalytics | null>(null);
  const [patterns, setPatterns] = useState<TravelPattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(1, 'year'),
    dayjs()
  ]);
  const [selectedMetric, setSelectedMetric] = useState<string>('spending');

  useEffect(() => {
    loadAnalytics();
  }, [user?.id, dateRange]);

  const loadAnalytics = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [analyticsData, patternsData] = await Promise.all([
        analyticsService.getTravelAnalytics(
          user.id, 
          dateRange[0].format('YYYY-MM-DD'),
          dateRange[1].format('YYYY-MM-DD')
        ),
        analyticsService.getTravelPatterns(user.id)
      ]);
      
      setAnalytics(analyticsData);
      setPatterns(patternsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!analytics) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Title level={3}>🔄 Đang phân tích dữ liệu du lịch của bạn...</Title>
      </div>
    );
  }

  const spendingTrendData = analytics.monthlySpending.map(item => ({
    month: item.month,
    spending: item.amount,
    trips: item.tripCount,
  }));

  const destinationData = analytics.topDestinations.map(dest => ({
    type: dest.destination,
    value: dest.visitCount,
  }));

  const carbonFootprintData = analytics.carbonFootprint.map(item => ({
    month: item.month,
    footprint: item.kgCO2,
  }));

  const travelStyleConfig = {
    data: [
      { type: 'Budget Travel', value: analytics.travelStyles.budget },
      { type: 'Comfort Travel', value: analytics.travelStyles.comfort },
      { type: 'Luxury Travel', value: analytics.travelStyles.luxury },
      { type: 'Adventure', value: analytics.travelStyles.adventure },
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}\n{percentage}',
    },
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2}>
              <FireOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
              Travel Analytics
            </Title>
            <Text type="secondary">Insights về thói quen và xu hướng du lịch của bạn</Text>
          </div>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates)}
              format="DD/MM/YYYY"
            />
            <Select
              value={selectedMetric}
              onChange={setSelectedMetric}
              style={{ width: 150 }}
            >
              <Option value="spending">Chi tiêu</Option>
              <Option value="frequency">Tần suất</Option>
              <Option value="carbon">Carbon Footprint</Option>
            </Select>
          </Space>
        </div>

        {/* Key Metrics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="🎯 Tổng chuyến đi"
                value={analytics.totalTrips}
                suffix="trips"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="💰 Tổng chi tiêu"
                value={analytics.totalSpending}
                prefix="$"
                precision={0}
                valueStyle={{ color: '#52c41a' }}
              />
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary">
                  Trung bình: ${Math.round(analytics.avgTripCost)}/chuyến
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="🌍 Quốc gia đã đến"
                value={analytics.countriesVisited}
                suffix="countries"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="🔥 Carbon Footprint"
                value={analytics.totalCarbonFootprint}
                suffix="kg CO₂"
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          {/* Spending Trend */}
          <Col xs={24} lg={12}>
            <Card title="📊 Xu hướng chi tiêu theo tháng" loading={loading}>
              <Line
                data={spendingTrendData}
                xField="month"
                yField="spending"
                smooth={true}
                point={{
                  size: 5,
                  shape: 'diamond',
                }}
                color="#1890ff"
              />
            </Card>
          </Col>

          {/* Travel Style Distribution */}
          <Col xs={24} lg={12}>
            <Card title="🎨 Phong cách du lịch" loading={loading}>
              <Pie {...travelStyleConfig} height={300} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          {/* Top Destinations */}
          <Col xs={24} lg={8}>
            <Card title="🏆 Top điểm đến yêu thích" loading={loading}>
              <List
                itemLayout="horizontal"
                dataSource={analytics.topDestinations.slice(0, 5)}
                renderItem={(item, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Badge count={index + 1} color="#1890ff">
                          <Avatar icon={<EnvironmentOutlined />} />
                        </Badge>
                      }
                      title={item.destination}
                      description={
                        <Space>
                          <Text type="secondary">{item.visitCount} lần</Text>
                          <Tag color="blue">${item.totalSpent}</Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Monthly Patterns */}
          <Col xs={24} lg={8}>
            <Card title="📅 Mẫu hình du lịch theo tháng" loading={loading}>
              <Column
                data={analytics.monthlyPatterns}
                xField="month"
                yField="count"
                color="#52c41a"
                columnWidthRatio={0.6}
              />
            </Card>
          </Col>

          {/* Travel Companions Stats */}
          <Col xs={24} lg={8}>
            <Card title="👥 Thống kê đồng hành" loading={loading}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Solo Travel:</Text>
                  <Text strong>{analytics.companionStats.solo}%</Text>
                </div>
                <Progress percent={analytics.companionStats.solo} strokeColor="#1890ff" />
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Với gia đình:</Text>
                  <Text strong>{analytics.companionStats.family}%</Text>
                </div>
                <Progress percent={analytics.companionStats.family} strokeColor="#52c41a" />
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Với bạn bè:</Text>
                  <Text strong>{analytics.companionStats.friends}%</Text>
                </div>
                <Progress percent={analytics.companionStats.friends} strokeColor="#722ed1" />
              </Space>
            </Card>
          </Col>
        </Row>

        {/* AI Insights */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card 
              title={
                <Space>
                  <StarOutlined style={{ color: '#fadb14' }} />
                  AI Insights & Recommendations
                </Space>
              }
              loading={loading}
            >
              <Timeline>
                {analytics.insights.map((insight, index) => (
                  <Timeline.Item
                    key={index}
                    dot={
                      insight.type === 'positive' ? 
                        <RiseOutlined style={{ color: '#52c41a' }} /> : 
                        <FallOutlined style={{ color: '#ff4d4f' }} />
                    }
                  >
                    <Space direction="vertical" size={4}>
                      <Text strong>{insight.title}</Text>
                      <Text type="secondary">{insight.description}</Text>
                      {insight.recommendation && (
                        <Tag color="blue">💡 {insight.recommendation}</Tag>
                      )}
                    </Space>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
        </Row>

        {/* Travel Goals Progress */}
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card title="🎯 Tiến độ mục tiêu du lịch 2025">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Progress
                      type="circle"
                      percent={Math.round((analytics.totalTrips / 12) * 100)}
                      format={() => `${analytics.totalTrips}/12`}
                    />
                    <div style={{ marginTop: '8px' }}>
                      <Text strong>Chuyến đi trong năm</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Progress
                      type="circle"
                      percent={Math.round((analytics.countriesVisited / 20) * 100)}
                      format={() => `${analytics.countriesVisited}/20`}
                      strokeColor="#52c41a"
                    />
                    <div style={{ marginTop: '8px' }}>
                      <Text strong>Quốc gia khám phá</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Progress
                      type="circle"
                      percent={Math.min(100, Math.round((analytics.totalCarbonFootprint / 5000) * 100))}
                      format={() => `${Math.round(analytics.totalCarbonFootprint)}kg`}
                      strokeColor="#fa8c16"
                    />
                    <div style={{ marginTop: '8px' }}>
                      <Text strong>Carbon Budget</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </motion.div>
  );
};