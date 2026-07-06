import React, { useState, useEffect } from 'react';
import {
  Typography, Card, Row, Col, Tag, Button, Space, Descriptions,
  Tabs, Spin, Empty, Modal, Divider, App, Input, List, Popconfirm, InputNumber, Form
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, DeleteOutlined,
  CalendarOutlined, UserOutlined,
  EnvironmentOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, PlusOutlined, PushpinOutlined, PushpinFilled
} from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { tripService, Trip, Itinerary, TripNote } from '../../services/trip.service';
import { ConversationViewer } from '../../components/ConversationViewer';
import { MessageOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { confirm } = Modal;
const { TextArea } = Input;

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [notes, setNotes] = useState<TripNote[]>([]);
  const [loading, setLoading] = useState(true);

  // Notes state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  // Budget Edit state
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetForm] = Form.useForm();
  const [editingBudgetSaving, setEditingBudgetSaving] = useState(false);

  // Get tab from URL or default to overview
  const defaultTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (!id) return;

    const fetchTripData = async () => {
      setLoading(true);
      try {
        const tripData = await tripService.getTripById(id);
        setTrip(tripData);

        // Fetch itinerary
        try {
          const itineraryData = await tripService.getItinerary(id);
          setItinerary(itineraryData);
        } catch (err) {
          console.error('Failed to load itinerary', err);
        }

        // Fetch notes
        try {
          const notesData = await tripService.getNotes(id);
          setNotes(notesData);
        } catch (err) {
          console.error('Failed to load notes', err);
        }

      } catch (error) {
        console.error('Error fetching trip data:', error);
        message.error('Failed to load trip details');
        navigate('/trips');
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [id, navigate]);

  // Note handlers
  const handleAddNote = async () => {
    if (!id || !newNoteContent.trim()) return;

    setNoteSaving(true);
    try {
      const newNote = await tripService.createNote(id, { content: newNoteContent.trim() });
      setNotes([newNote, ...notes]);
      setNewNoteContent('');
      message.success('Đã thêm ghi chú');
    } catch (error) {
      console.error('Error creating note:', error);
      message.error('Không thể thêm ghi chú');
    } finally {
      setNoteSaving(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editingNoteContent.trim()) return;

    setNoteSaving(true);
    try {
      const updatedNote = await tripService.updateNote(noteId, { content: editingNoteContent.trim() });
      setNotes(notes.map(n => n.id === noteId ? updatedNote : n));
      setEditingNoteId(null);
      setEditingNoteContent('');
      message.success('Đã cập nhật ghi chú');
    } catch (error) {
      console.error('Error updating note:', error);
      message.error('Không thể cập nhật ghi chú');
    } finally {
      setNoteSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await tripService.deleteNote(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
      message.success('Đã xóa ghi chú');
    } catch (error) {
      console.error('Error deleting note:', error);
      message.error('Không thể xóa ghi chú');
    }
  };

  const handleTogglePin = async (note: TripNote) => {
    try {
      const updatedNote = await tripService.updateNote(note.id, { isPinned: !note.isPinned });
      setNotes(notes.map(n => n.id === note.id ? updatedNote : n).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }));
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleDeleteTrip = () => {
    if (!trip) return;

    confirm({
      title: 'Xóa chuyến đi',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa "${trip.name}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await tripService.deleteTrip(trip.id);
          message.success('Xóa chuyến đi thành công');
          navigate('/trips');
        } catch (error) {
          console.error('Error deleting trip:', error);
          message.error('Không thể xóa chuyến đi');
        }
      },
    });
  };

  // Budget Handlers
  const handleOpenBudgetEdit = () => {
    if (!trip) return;
    const breakdown = trip.budget?.breakdown || {
      flights: 0, accommodation: 0, activities: 0, food: 0, transport: 0, other: 0
    };
    budgetForm.setFieldsValue(breakdown);
    setIsBudgetModalOpen(true);
  };

  const handleSaveBudget = async () => {
    if (!trip) return;

    try {
      const values = await budgetForm.validateFields();
      setEditingBudgetSaving(true);

      // Keep existing total (user's fixed budget), only update breakdown
      const newBudget = {
        total: trip.budget?.total || 0, // Keep original budget, don't recalculate
        currency: trip.budget?.currency || 'VND',
        breakdown: values
      };

      const updatedTrip = await tripService.updateTrip(trip.id, { budget: newBudget });
      setTrip(updatedTrip);
      setIsBudgetModalOpen(false);
      message.success('Đã cập nhật ngân sách');
    } catch (error) {
      console.error('Error updating budget:', error);
      message.error('Không thể cập nhật ngân sách');
    } finally {
      setEditingBudgetSaving(false);
    }
  };

  const budgetItems = [
    { key: 'accommodation', label: 'Lưu trú' },
    { key: 'transport', label: 'Di chuyển' },
    { key: 'food', label: 'Ăn uống' },
    { key: 'activities', label: 'Hoạt động/Vé' },
    { key: 'other', label: 'Chi phí khác' },
  ];

  const formatDestination = (destination: Trip['destination']): string => {
    return `${destination.city}, ${destination.country}`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDuration = (startDate: Date, endDate: Date): number => {
    return Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải chi tiết chuyến đi...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Empty description="Không tìm thấy chuyến đi" />
        <Button type="primary" onClick={() => navigate('/trips')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const duration = getDuration(trip.startDate, trip.endDate);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/trips')}
          style={{ marginBottom: 16 }}
        >
          Quay lại danh sách
        </Button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Space align="center" style={{ marginBottom: 8 }}>
              <Title level={2} style={{ marginBottom: 0 }}>
                {trip.name}
              </Title>
              <Tag
                color={tripService.getStatusColor(trip.status as any)}
                style={{ fontSize: '12px', padding: '2px 8px' }}
              >
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' ')}
              </Tag>
            </Space>
            <Space size="middle" wrap>
              <Space size={4}>
                <EnvironmentOutlined style={{ color: '#666' }} />
                <Text type="secondary">{formatDestination(trip.destination)}</Text>
              </Space>
              <Space size={4}>
                <CalendarOutlined style={{ color: '#666' }} />
                <Text type="secondary">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</Text>
              </Space>
              <Space size={4}>
                <ClockCircleOutlined style={{ color: '#666' }} />
                <Text type="secondary">{duration} ngày</Text>
              </Space>
              <Space size={4}>
                <UserOutlined style={{ color: '#666' }} />
                <Text type="secondary">{trip.participants} người</Text>
              </Space>
            </Space>
          </div>

          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/trips/${trip.id}/edit`)}
            >
              Sửa
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteTrip}
            >
              Xóa
            </Button>
          </Space>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: 'Tổng quan',
            children: (
              <Row gutter={[16, 16]}>
                {/* Trip Details */}
                <Col xs={24} lg={12}>
                  <Card title="Chi tiết chuyến đi" size="small">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Điểm đến">
                        {formatDestination(trip.destination)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày bắt đầu">
                        {formatDate(trip.startDate)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày kết thúc">
                        {formatDate(trip.endDate)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Thời gian">
                        {duration} ngày
                      </Descriptions.Item>
                      <Descriptions.Item label="Số khách">
                        {trip.participants} người
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>

                {/* Budget Information */}
                <Col xs={24} lg={12}>
                  <Card
                    title="Chi phí"
                    size="small"
                    extra={
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={handleOpenBudgetEdit}
                      >
                        Sửa
                      </Button>
                    }
                  >
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong>Ngân sách</Text>
                        <Text style={{ fontSize: '18px', color: '#722ed1', fontWeight: 'bold' }}>
                          {trip.budget ? tripService.formatBudget(trip.budget.total, trip.budget.currency) : '$0'}
                        </Text>
                      </div>
                    </div>

                    <Divider style={{ margin: '12px 0' }} />

                    <div style={{ fontSize: '13px' }}>
                      {budgetItems.map(item => {
                        const amount = (trip.budget?.breakdown as any)?.[item.key] || 0;
                        const duration = trip.startDate && trip.endDate ? getDuration(trip.startDate, trip.endDate) : 1;
                        const isAccommodation = item.key === 'accommodation';
                        const perNightAmount = isAccommodation && duration > 0 ? Math.round(amount / duration) : 0;

                        return (
                          <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottom: '1px dashed #f0f0f0' }}>
                            <Text type="secondary">{item.label}</Text>
                            {isAccommodation && amount > 0 ? (
                              <div style={{ textAlign: 'right' }}>
                                <Text style={{ display: 'block', fontSize: '12px', color: '#8c8c8c' }}>
                                  {tripService.formatBudget(perNightAmount, trip.budget?.currency)} (1 đêm)
                                </Text>
                                <Text style={{ fontWeight: 500 }}>
                                  {tripService.formatBudget(amount, trip.budget?.currency)} ({duration} đêm)
                                </Text>
                              </div>
                            ) : (
                              <Text>{tripService.formatBudget(amount, trip.budget?.currency)}</Text>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Tổng chi phí = SUM của các breakdown */}
                    <Divider style={{ margin: '12px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>Tổng chi phí</Text>
                      <Text style={{ fontSize: '16px', color: '#52c41a', fontWeight: 'bold' }}>
                        {tripService.formatBudget(
                          budgetItems.reduce((sum, item) => sum + ((trip.budget?.breakdown as any)?.[item.key] || 0), 0),
                          trip.budget?.currency
                        )}
                      </Text>
                    </div>
                  </Card>
                </Col>

                {/* Notes Section with Improved UI */}
                <Col xs={24}>
                  <Card
                    title={
                      <Space>
                        <PushpinOutlined />
                        <span>Ghi chú chuyến đi</span>
                        <Tag color="blue" style={{ borderRadius: '10px' }}>{notes.length}</Tag>
                      </Space>
                    }
                    bodyStyle={{ padding: '24px', background: '#f8f9fa' }}
                    style={{ overflow: 'hidden' }}
                  >
                    {/* Add new note Form */}
                    <div style={{
                      background: '#fff',
                      padding: '16px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                      marginBottom: '24px',
                      border: '1px solid #f0f0f0'
                    }}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong type="secondary" style={{ fontSize: '13px' }}>THÊM GHI CHÚ MỚI</Text>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <TextArea
                          placeholder="Nhập nội dung ghi chú..."
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          autoSize={{ minRows: 2, maxRows: 6 }}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid #d9d9d9',
                            resize: 'none',
                            padding: '10px 14px'
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddNote}
                            loading={noteSaving && !editingNoteId}
                            disabled={!newNoteContent.trim()}
                            style={{
                              borderRadius: '6px',
                              paddingLeft: '20px',
                              paddingRight: '20px'
                            }}
                          >
                            Lưu ghi chú
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Notes List */}
                    {notes.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Pinned Notes First */}
                        {notes.filter(n => n.isPinned).map((note) => (
                          <div
                            key={note.id}
                            style={{
                              background: '#fffbe6',
                              borderRadius: '8px',
                              padding: '16px',
                              border: '1px solid #ffe58f',
                              position: 'relative',
                              boxShadow: '0 2px 4px rgba(250, 173, 20, 0.1)'
                            }}
                          >
                            <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#faad14' }}>
                              <PushpinFilled />
                            </div>

                            {editingNoteId === note.id ? (
                              <div style={{ width: '100%', marginTop: '4px' }}>
                                <TextArea
                                  value={editingNoteContent}
                                  onChange={(e) => setEditingNoteContent(e.target.value)}
                                  autoSize={{ minRows: 3, maxRows: 6 }}
                                  autoFocus
                                  style={{ marginBottom: 8, borderRadius: 6 }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                  <Button size="small" onClick={() => setEditingNoteId(null)}>Hủy</Button>
                                  <Button
                                    size="small"
                                    onClick={() => handleUpdateNote(note.id)}
                                    type="primary"
                                  >
                                    Lưu thay đổi
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div style={{ marginRight: '24px', whiteSpace: 'pre-wrap', color: '#1f1f1f', fontSize: '15px', fontWeight: 500 }}>
                                  {note.content}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {new Date(note.createdAt).toLocaleString('vi-VN')}
                                  </Text>
                                  <Space size="small">
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<PushpinFilled style={{ color: '#faad14' }} />}
                                      onClick={() => handleTogglePin(note)}
                                      title="Bỏ ghim"
                                    />
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<EditOutlined />}
                                      onClick={() => {
                                        setEditingNoteId(note.id);
                                        setEditingNoteContent(note.content);
                                      }}
                                    />
                                    <Popconfirm
                                      title="Xóa ghi chú này?"
                                      onConfirm={() => handleDeleteNote(note.id)}
                                      okText="Xóa"
                                      cancelText="Hủy"
                                    >
                                      <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                  </Space>
                                </div>
                              </>
                            )}
                          </div>
                        ))}

                        {/* Regular Notes */}
                        {notes.filter(n => !n.isPinned).map((note) => (
                          <div
                            key={note.id}
                            style={{
                              background: '#fff',
                              borderRadius: '8px',
                              padding: '16px',
                              border: '1px solid #f0f0f0',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                              transition: 'all 0.3s'
                            }}
                          >
                            {editingNoteId === note.id ? (
                              <div style={{ width: '100%' }}>
                                <TextArea
                                  value={editingNoteContent}
                                  onChange={(e) => setEditingNoteContent(e.target.value)}
                                  autoSize={{ minRows: 3, maxRows: 6 }}
                                  autoFocus
                                  style={{ marginBottom: 8, borderRadius: 6 }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                  <Button size="small" onClick={() => setEditingNoteId(null)}>Hủy</Button>
                                  <Button
                                    size="small"
                                    onClick={() => handleUpdateNote(note.id)}
                                    type="primary"
                                  >
                                    Lưu thay đổi
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div style={{ whiteSpace: 'pre-wrap', color: '#262626', fontSize: '15px' }}>
                                  {note.content}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {new Date(note.createdAt).toLocaleString('vi-VN')}
                                  </Text>
                                  <Space size="small">
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<PushpinOutlined style={{ color: '#bfbfbf' }} />}
                                      onClick={() => handleTogglePin(note)}
                                      title="Ghim"
                                    />
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<EditOutlined style={{ color: '#8c8c8c' }} />}
                                      onClick={() => {
                                        setEditingNoteId(note.id);
                                        setEditingNoteContent(note.content);
                                      }}
                                    />
                                    <Popconfirm
                                      title="Xóa ghi chú này?"
                                      onConfirm={() => handleDeleteNote(note.id)}
                                      okText="Xóa"
                                      cancelText="Hủy"
                                    >
                                      <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                  </Space>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty
                        description="Chưa có ghi chú nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ margin: '32px 0' }}
                      />
                    )}
                  </Card>
                </Col>
              </Row>
            )
          },

          // Agent Chat tab (only for agent bookings)
          ...((trip as any)?.source === 'agent_booking' ? [{
            key: 'conversation',
            label: (
              <span>
                <MessageOutlined /> Agent Chat
              </span>
            ),
            children: (
              <ConversationViewer tripId={id!} />
            )
          }] : [])
        ]}
      />
      {/* Budget Edit Modal */}
      <Modal
        title="Chỉnh sửa chi phí dự kiến"
        open={isBudgetModalOpen}
        onOk={handleSaveBudget}
        onCancel={() => setIsBudgetModalOpen(false)}
        confirmLoading={editingBudgetSaving}
        okText="Lưu thay đổi"
        cancelText="Hủy"
      >
        <Form
          form={budgetForm}
          layout="vertical"
        >
          <Row gutter={16}>
            {budgetItems.map(item => (
              <Col span={12} key={item.key}>
                <Form.Item
                  name={item.key}
                  label={item.label}
                  initialValue={0}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
                    min={0}
                    addonAfter="đ"
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
            <Text strong>Tổng cộng:</Text>
            <Form.Item shouldUpdate style={{ marginBottom: 0 }}>
              {() => {
                const values = budgetForm.getFieldsValue();
                const total = Object.values(values).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
                return <Text strong style={{ fontSize: '16px', color: '#722ed1' }}>{tripService.formatBudget(total, 'VND')}</Text>;
              }}
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};