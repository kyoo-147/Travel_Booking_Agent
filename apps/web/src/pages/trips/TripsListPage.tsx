import React, { useState, useEffect } from 'react';
import { Typography, Table, Button, Space, Tag, Card, Statistic, Row, Col, Modal, App } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, MessageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { tripService, Trip } from '../../services/trip.service';
import { useAuth } from '../../contexts/AuthContext';
import { AgentBadge } from '../../components/AgentBadge';

const { Title, Paragraph } = Typography;
const { confirm } = Modal;

export const TripsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { message } = App.useApp();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch trips from API
  useEffect(() => {
    const fetchTrips = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const userTrips = await tripService.getTripsByUser(user.id);
        setTrips(Array.isArray(userTrips) ? userTrips : []);
      } catch (error) {
        console.error('Error fetching trips:', error);
        message.error('Failed to load trips');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [user?.id]);

  const handleDeleteTrip = (tripId: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa chuyến đi này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await tripService.deleteTrip(tripId);
          setTrips(trips.filter(trip => trip.id !== tripId));
          message.success('Xóa chuyến đi thành công');
        } catch (error) {
          console.error('Error deleting trip:', error);
          message.error('Không thể xóa chuyến đi');
        }
      },
    });
  };

  const formatDestination = (destination: Trip['destination']): string => {
    return `${destination.city}, ${destination.country}`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString();
  };

  const getTripDuration = (startDate: Date, endDate: Date): number => {
    return Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatUpdateTime = (date: Date): string => {
    return new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      draft: 'Nháp',
      pending_booking: 'Chờ đặt',
      confirmed: 'Đã xác nhận',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      agent_booking: 'Agent Booking'
    };
    return map[status] || status;
  };

  const columns = [
    {
      title: 'Tên chuyến đi',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Trip) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {formatDestination(record.destination)}
          </div>
          {(record as any).source === 'agent_booking' && (
            <div style={{ marginTop: 4 }}>
              <AgentBadge size="small" />
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Thời gian',
      key: 'dates',
      render: (record: Trip) => (
        <div>
          <div>{formatDate(record.startDate)}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            đến {formatDate(record.endDate)}
          </div>
          <div style={{ color: '#666', fontSize: '11px' }}>
            ({getTripDuration(record.startDate, record.endDate)} ngày)
          </div>
          <div style={{ color: '#999', fontSize: '10px', marginTop: '4px' }}>
            Cập nhật: {formatUpdateTime(record.updatedAt)}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={tripService.getStatusColor(status as any)}>
          {translateStatus(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngân sách',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget: Trip['budget']) =>
        tripService.formatBudget(budget.total, budget.currency),
    },
    {
      title: 'Số người',
      dataIndex: 'participants',
      key: 'participants',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (record: Trip) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/trips/${record.id}`)}
          >
            Xem
          </Button>

          {(record as any).source === 'agent_booking' ? (
            <Button
              icon={<MessageOutlined />}
              size="small"
              type="primary"
              onClick={() => navigate(`/trips/${record.id}?tab=conversation`)}
            >
              Chat
            </Button>
          ) : (
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/trips/${record.id}/edit`)}
            >
              Sửa
            </Button>
          )}

          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeleteTrip(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget?.total || 0), 0);
  const completedTrips = trips.filter(trip => trip.status === 'completed').length;
  const upcomingTrips = trips.filter(trip => trip.status === 'confirmed').length;
  const agentBookings = trips.filter(trip => (trip as any).source === 'agent_booking').length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div>
          <Title level={2}>Chuyến đi của tôi</Title>
          <Paragraph>Quản lý tất cả kế hoạch du lịch của bạn tại một nơi</Paragraph>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng số chuyến đi"
              value={trips.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Booking qua Agent"
              value={agentBookings}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Sắp tới"
              value={upcomingTrips}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng ngân sách"
              value={totalBudget}
              prefix="$"
              precision={0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {trips.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Title level={4} type="secondary">No trips found</Title>
            <Paragraph type="secondary">
              Start planning your first adventure!
            </Paragraph>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/trips/new')}
            >
              Create Your First Trip
            </Button>
          </div>
        ) : (
          <Table
            dataSource={trips}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} trips`,
            }}
          />
        )}
      </Card>
    </div >
  );
};