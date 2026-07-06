import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Typography,
  App,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  Dropdown,
  MenuProps,
  DatePicker,
  InputNumber,
  Image,
  Upload,
  Rate,
  Tabs,
  List,
  Avatar,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  TeamOutlined,
  StarOutlined,
  EyeOutlined,
  FilterOutlined,
  ExportOutlined,
  CameraOutlined,
  ClockCircleOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { tripApiService, Trip as ApiTrip } from '../../services/trip-api.service';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface Trip {
  id: string;
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  status: 'draft' | 'published' | 'full' | 'completed' | 'cancelled';
  category: 'adventure' | 'cultural' | 'beach' | 'mountain' | 'city' | 'eco';
  rating: number;
  reviewCount: number;
  images: string[];
  features: string[];
  createdAt: string;
  updatedAt: string;
  guide: {
    name: string;
    avatar: string;
    rating: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in days
}

interface TripReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export const TripManagementPage: React.FC = () => {
  const { message } = App.useApp();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewingTrip, setViewingTrip] = useState<Trip | null>(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Sample data
  const sampleTrips: Trip[] = [
    {
      id: '1',
      title: 'Du lịch Sapa - Chinh phục đỉnh Fansipan',
      description: 'Hành trình khám phá vẻ đẹp núi rừng Tây Bắc với những thửa ruộng bậc thang tuyệt đẹp và chinh phục nóc nhà Đông Dương.',
      destination: 'Sapa, Lào Cai',
      startDate: '2024-02-15',
      endDate: '2024-02-18',
      price: 3500000,
      maxParticipants: 20,
      currentParticipants: 15,
      status: 'published',
      category: 'mountain',
      rating: 4.8,
      reviewCount: 25,
      images: [
        'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
      ],
      features: ['Hướng dẫn viên chuyên nghiệp', 'Bữa ăn địa phương', 'Khách sạn 3 sao', 'Xe riêng'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-15',
      guide: {
        name: 'Nguyễn Văn Minh',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guide1',
        rating: 4.9,
      },
      difficulty: 'medium',
      duration: 4,
    },
    {
      id: '2',
      title: 'Tour Hạ Long - Cát Bà 3N2Đ',
      description: 'Khám phá kỳ quan thế giới vịnh Hạ Long với những hang động tuyệt đẹp và đảo Cát Bà hoang sơ.',
      destination: 'Hạ Long, Quảng Ninh',
      startDate: '2024-02-20',
      endDate: '2024-02-22',
      price: 2800000,
      maxParticipants: 30,
      currentParticipants: 28,
      status: 'published',
      category: 'beach',
      rating: 4.6,
      reviewCount: 42,
      images: [
        'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      ],
      features: ['Du thuyền 4 sao', 'Bữa ăn hải sản', 'Tham quan hang động', 'Kayaking'],
      createdAt: '2024-01-08',
      updatedAt: '2024-01-12',
      guide: {
        name: 'Trần Thị Lan',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guide2',
        rating: 4.7,
      },
      difficulty: 'easy',
      duration: 3,
    },
    {
      id: '3',
      title: 'Phú Quốc - Thiên đường biển đảo',
      description: 'Thư giãn tại đảo ngọc Phú Quốc với những bãi biển trắng mịn và nước biển trong xanh.',
      destination: 'Phú Quốc, Kiên Giang',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      price: 4200000,
      maxParticipants: 25,
      currentParticipants: 12,
      status: 'published',
      category: 'beach',
      rating: 4.9,
      reviewCount: 38,
      images: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      ],
      features: ['Resort 5 sao', 'Spa thư giãn', 'Tour câu cá', 'Lặn ngắm san hô'],
      createdAt: '2024-01-05',
      updatedAt: '2024-01-18',
      guide: {
        name: 'Lê Văn Hùng',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guide3',
        rating: 4.8,
      },
      difficulty: 'easy',
      duration: 5,
    },
  ];

  const sampleReviews: TripReview[] = [
    {
      id: '1',
      userId: '1',
      userName: 'Nguyễn Thị Mai',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
      rating: 5,
      comment: 'Chuyến đi tuyệt vời! Cảnh đẹp, hướng dẫn viên nhiệt tình.',
      date: '2024-01-20',
    },
    {
      id: '2',
      userId: '2',
      userName: 'Trần Văn Nam',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
      rating: 4,
      comment: 'Dịch vụ tốt, sẽ quay lại lần sau.',
      date: '2024-01-18',
    },
  ];

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const apiTrips = await tripApiService.getAllTrips();
      // Transform API trips to local Trip format
      const transformedTrips = apiTrips.map(apiTrip => {
        // Safely handle destination structure
        const destinationText = apiTrip.destination && Array.isArray(apiTrip.destination.cities)
          ? apiTrip.destination.cities.join(', ')
          : apiTrip.destination?.country || 'Unknown Destination';
        
        // Safely handle preferences.interests
        const interests = Array.isArray(apiTrip.preferences?.interests) 
          ? apiTrip.preferences.interests 
          : [];

        return {
          id: apiTrip.id,
          title: apiTrip.name,
          description: `Khám phá ${destinationText}`,
          destination: destinationText,
          startDate: apiTrip.startDate,
          endDate: apiTrip.endDate,
          price: apiTrip.budget?.amount || 0,
          maxParticipants: (apiTrip.participants || 1) + 2,
          currentParticipants: apiTrip.participants || 1,
          status: (apiTrip.status === 'confirmed' ? 'published' : 
                  apiTrip.status === 'draft' ? 'draft' : 'published') as 'draft' | 'published' | 'full' | 'completed' | 'cancelled',
          category: 'cultural' as const,
          rating: 4.5,
          reviewCount: Math.floor(Math.random() * 50) + 10,
          images: [`https://picsum.photos/400/300?random=${apiTrip.id}`],
          features: interests,
          createdAt: apiTrip.createdAt,
          updatedAt: apiTrip.updatedAt,
          difficulty: 'medium' as const,
          duration: Math.floor((new Date(apiTrip.endDate).getTime() - new Date(apiTrip.startDate).getTime()) / (1000 * 60 * 60 * 24)),
          guide: {
            name: 'Hướng dẫn viên',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiTrip.id}`,
            rating: 4.8,
            experience: '5+ years'
          }
        };
      });
      setTrips(transformedTrips);
      console.log('✅ Loaded real data from API:', transformedTrips.length, 'trips');
    } catch (error) {
      console.error('❌ Failed to load trips from API:', error);
      message.error('Không thể tải dữ liệu trips từ API. Sử dụng dữ liệu mẫu.');
      // Fallback to mock data
      setTrips(sampleTrips);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleAddTrip = () => {
    setEditingTrip(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    form.setFieldsValue({
      ...trip,
      dateRange: [dayjs(trip.startDate), dayjs(trip.endDate)],
    });
    setFileList(
      trip.images.map((url, index) => ({
        uid: index.toString(),
        name: `image-${index}.jpg`,
        status: 'done',
        url,
      }))
    );
    setIsModalVisible(true);
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      setTrips(trips.filter(trip => trip.id !== tripId));
      message.success('Xóa tour thành công!');
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa tour!');
    }
  };

  const handleViewTrip = (trip: Trip) => {
    setViewingTrip(trip);
    setIsViewModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const [startDate, endDate] = values.dateRange;

      const tripData = {
        ...values,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        images: fileList.map(file => file.url || file.response?.url || ''),
        currentParticipants: editingTrip?.currentParticipants || 0,
        rating: editingTrip?.rating || 0,
        reviewCount: editingTrip?.reviewCount || 0,
        duration: endDate.diff(startDate, 'day') + 1,
      };

      if (editingTrip) {
        setTrips(trips.map(trip =>
          trip.id === editingTrip.id
            ? { ...trip, ...tripData, updatedAt: new Date().toISOString().split('T')[0] }
            : trip
        ));
        message.success('Cập nhật tour thành công!');
      } else {
        const newTrip: Trip = {
          id: Date.now().toString(),
          ...tripData,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          guide: {
            name: 'Hướng dẫn viên',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=newguide',
            rating: 5.0,
          },
        };
        setTrips([...trips, newTrip]);
        message.success('Thêm tour thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      adventure: 'red',
      cultural: 'blue',
      beach: 'cyan',
      mountain: 'green',
      city: 'purple',
      eco: 'orange',
    };
    return colors[category] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'default',
      published: 'green',
      full: 'orange',
      completed: 'blue',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      draft: 'Nháp',
      published: 'Đã xuất bản',
      full: 'Đã đầy',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'green',
      medium: 'orange',
      hard: 'red',
    };
    return colors[difficulty] || 'default';
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchText.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = filterCategory === 'all' || trip.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || trip.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'export',
      label: 'Xuất dữ liệu',
      icon: <ExportOutlined />,
    },
    {
      key: 'bulk-edit',
      label: 'Chỉnh sửa hàng loạt',
      icon: <EditOutlined />,
    },
  ];

  const columns: ColumnsType<Trip> = [
    {
      title: 'Tour',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Trip) => (
        <div style={{ display: 'flex', gap: '12px' }}>
          <Image
            width={60}
            height={60}
            src={record.images[0]}
            style={{ borderRadius: '8px', objectFit: 'cover' }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+5Jm4YLBuOHuFdcJpGi+H1AOjMY3jJtlq/xYalwxuF7ALEYzBSfAkMGKLXM7C1O9NT7/t8/Vu3f9VVp5/znbXCnFn+o3/57/s2/3n8vOGfPq9xp+eCf4vhPB6u8z++hd09+kXcGh+H86dN0rKjOLZ8tPuXaD+f0c+/fHpb2ZDZ+u3zHhvJXA== "
          />
          <div>
            <div style={{ fontWeight: 500, marginBottom: '4px' }}>{text}</div>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              <EnvironmentOutlined style={{ marginRight: 4 }} />
              {record.destination}
            </Text>
            <div style={{ marginTop: '4px' }}>
              <Rate disabled defaultValue={record.rating} style={{ fontSize: '12px' }} />
              <Text style={{ fontSize: '12px', marginLeft: '4px' }}>
                ({record.reviewCount})
              </Text>
            </div>
          </div>
        </div>
      ),
      width: 300,
    },
    {
      title: 'Thời gian',
      key: 'duration',
      render: (_, record: Trip) => (
        <div>
          <div style={{ fontSize: '12px', marginBottom: '2px' }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {new Date(record.startDate).toLocaleDateString('vi-VN')}
          </div>
          <div style={{ fontSize: '12px', marginBottom: '2px' }}>
            → {new Date(record.endDate).toLocaleDateString('vi-VN')}
          </div>
          <Tag color="blue">
            <ClockCircleOutlined style={{ marginRight: 2 }} />
            {record.duration} ngày
          </Tag>
        </div>
      ),
    },
    {
      title: 'Giá & Độ khó',
      key: 'price',
      render: (_, record: Trip) => (
        <div>
          <div style={{ fontWeight: 500, color: '#f5222d', marginBottom: '4px' }}>
            {record.price.toLocaleString('vi-VN')} VNĐ
          </div>
          <Tag color={getDifficultyColor(record.difficulty)}>
            {record.difficulty === 'easy' ? 'Dễ' :
              record.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={getCategoryColor(category)}>
          {category === 'adventure' ? '🏔️ Phiêu lưu' :
            category === 'cultural' ? '🏛️ Văn hóa' :
              category === 'beach' ? '🏖️ Biển' :
                category === 'mountain' ? '⛰️ Núi' :
                  category === 'city' ? '🏙️ Thành phố' :
                    category === 'eco' ? '🌿 Sinh thái' : category}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={getStatusColor(status) as any}
          text={getStatusText(status)}
        />
      ),
    },
    {
      title: 'Người tham gia',
      key: 'participants',
      render: (_, record: Trip) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
            <TeamOutlined />
            <Text>{record.currentParticipants}/{record.maxParticipants}</Text>
          </div>
          <div style={{ background: '#f0f0f0', borderRadius: '10px', height: '6px', overflow: 'hidden' }}>
            <div
              style={{
                background: record.currentParticipants >= record.maxParticipants ? '#ff4d4f' : '#52c41a',
                height: '100%',
                width: `${(record.currentParticipants / record.maxParticipants) * 100}%`,
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record: Trip) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewTrip(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditTrip(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tour này?"
            onConfirm={() => handleDeleteTrip(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Statistics
  const stats = {
    total: trips.length,
    published: trips.filter(t => t.status === 'published').length,
    draft: trips.filter(t => t.status === 'draft').length,
    totalRevenue: trips.reduce((sum, trip) => sum + (trip.price * trip.currentParticipants), 0),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>
          🎯 Quản lý Tours
        </Title>

        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số tour"
                value={stats.total}
                prefix={<EnvironmentOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã xuất bản"
                value={stats.published}
                prefix={<FireOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Bản nháp"
                value={stats.draft}
                prefix={<EditOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Doanh thu"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
                precision={0}
                formatter={(value) => `${Number(value).toLocaleString('vi-VN')} VNĐ`}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Table Card */}
        <Card>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Input.Search
                placeholder="Tìm kiếm tour..."
                style={{ width: 300 }}
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                enterButton={<SearchOutlined />}
              />

              <Select
                placeholder="Danh mục"
                style={{ width: 150 }}
                value={filterCategory}
                onChange={setFilterCategory}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả danh mục</Option>
                <Option value="adventure">Phiêu lưu</Option>
                <Option value="cultural">Văn hóa</Option>
                <Option value="beach">Biển</Option>
                <Option value="mountain">Núi</Option>
                <Option value="city">Thành phố</Option>
                <Option value="eco">Sinh thái</Option>
              </Select>

              <Select
                placeholder="Trạng thái"
                style={{ width: 150 }}
                value={filterStatus}
                onChange={setFilterStatus}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="draft">Nháp</Option>
                <Option value="published">Đã xuất bản</Option>
                <Option value="full">Đã đầy</Option>
                <Option value="completed">Hoàn thành</Option>
                <Option value="cancelled">Đã hủy</Option>
              </Select>
            </Space>

            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddTrip}
              >
                Thêm tour mới
              </Button>

              <Dropdown menu={{ items: moreMenuItems }} placement="bottomRight">
                <Button icon={<MoreOutlined />} />
              </Dropdown>
            </Space>
          </div>

          <Table<Trip>
            columns={columns}
            dataSource={filteredTrips}
            rowKey="id"
            loading={loading}
            pagination={{
              total: filteredTrips.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} tour`,
            }}
            scroll={{ x: 1400 }}
          />
        </Card>

        {/* Add/Edit Trip Modal */}
        <Modal
          title={editingTrip ? 'Chỉnh sửa tour' : 'Thêm tour mới'}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => setIsModalVisible(false)}
          width={800}
          okText={editingTrip ? 'Cập nhật' : 'Thêm mới'}
          cancelText="Hủy"
        >
          <Form form={form} layout="vertical" requiredMark={false}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Tên tour"
                  name="title"
                  rules={[{ required: true, message: 'Vui lòng nhập tên tour!' }]}
                >
                  <Input placeholder="Nhập tên tour" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Điểm đến"
                  name="destination"
                  rules={[{ required: true, message: 'Vui lòng nhập điểm đến!' }]}
                >
                  <Input placeholder="Nhập điểm đến" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Thời gian"
                  name="dateRange"
                  rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
                >
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Giá tour"
                  name="price"
                  rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Nhập giá"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    addonAfter="VNĐ"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Số người tối đa"
                  name="maxParticipants"
                  rules={[{ required: true, message: 'Vui lòng nhập số người!' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Số người"
                    min={1}
                    max={100}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Độ khó"
                  name="difficulty"
                  rules={[{ required: true, message: 'Vui lòng chọn độ khó!' }]}
                >
                  <Select placeholder="Chọn độ khó">
                    <Option value="easy">Dễ</Option>
                    <Option value="medium">Trung bình</Option>
                    <Option value="hard">Khó</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Danh mục"
                  name="category"
                  rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                >
                  <Select placeholder="Chọn danh mục">
                    <Option value="adventure">🏔️ Phiêu lưu</Option>
                    <Option value="cultural">🏛️ Văn hóa</Option>
                    <Option value="beach">🏖️ Biển</Option>
                    <Option value="mountain">⛰️ Núi</Option>
                    <Option value="city">🏙️ Thành phố</Option>
                    <Option value="eco">🌿 Sinh thái</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Trạng thái"
                  name="status"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                >
                  <Select placeholder="Chọn trạng thái">
                    <Option value="draft">Nháp</Option>
                    <Option value="published">Xuất bản</Option>
                    <Option value="cancelled">Hủy</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Mô tả" name="description">
              <TextArea rows={4} placeholder="Nhập mô tả tour" />
            </Form.Item>

            <Form.Item label="Hình ảnh">
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
              >
                {fileList.length < 5 && (
                  <div>
                    <CameraOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Form>
        </Modal>

        {/* View Trip Modal */}
        <Modal
          title="Chi tiết tour"
          open={isViewModalVisible}
          onCancel={() => setIsViewModalVisible(false)}
          footer={null}
          width={900}
        >
          {viewingTrip && (
            <Tabs 
              defaultActiveKey="1"
              items={[
                {
                  key: '1',
                  label: 'Thông tin chung',
                  children: (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Image.PreviewGroup>
                          {viewingTrip.images.map((img, index) => (
                            <Image
                              key={index}
                              width="100%"
                              height={200}
                              src={img}
                              style={{ borderRadius: '8px', objectFit: 'cover', marginBottom: '8px' }}
                            />
                          ))}
                        </Image.PreviewGroup>
                      </Col>
                      <Col span={12}>
                        <Title level={3}>{viewingTrip.title}</Title>
                        <Paragraph>{viewingTrip.description}</Paragraph>

                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <div>
                            <Text strong>📍 Điểm đến: </Text>
                            <Text>{viewingTrip.destination}</Text>
                          </div>
                          <div>
                            <Text strong>💰 Giá: </Text>
                            <Text style={{ color: '#f5222d', fontSize: '16px' }}>
                              {viewingTrip.price.toLocaleString('vi-VN')} VNĐ
                            </Text>
                          </div>
                          <div>
                            <Text strong>👥 Người tham gia: </Text>
                            <Text>{viewingTrip.currentParticipants}/{viewingTrip.maxParticipants}</Text>
                          </div>
                          <div>
                            <Text strong>⭐ Đánh giá: </Text>
                            <Rate disabled value={viewingTrip.rating} />
                            <Text style={{ marginLeft: '8px' }}>({viewingTrip.reviewCount} đánh giá)</Text>
                          </div>
                          <div>
                            <Text strong>🎯 Hướng dẫn viên: </Text>
                            <Space>
                              <Avatar src={viewingTrip.guide.avatar} />
                              <Text>{viewingTrip.guide.name}</Text>
                              <Rate disabled value={viewingTrip.guide.rating} style={{ fontSize: '12px' }} />
                            </Space>
                          </div>
                        </Space>
                      </Col>
                    </Row>
                  )
                },
                {
                  key: '2',
                  label: 'Đánh giá',
                  children: (
                    <List
                      dataSource={sampleReviews}
                      renderItem={(review) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar src={review.userAvatar} />}
                            title={
                              <Space>
                                <Text strong>{review.userName}</Text>
                                <Rate disabled value={review.rating} style={{ fontSize: '12px' }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  {new Date(review.date).toLocaleDateString('vi-VN')}
                                </Text>
                              </Space>
                            }
                            description={review.comment}
                          />
                        </List.Item>
                      )}
                    />
                  )
                }
              ]}
            />
          )}
        </Modal>
      </div>
    </motion.div>
  );
};