import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Avatar, Typography, Button, Descriptions, Tag,
  Space, Divider, Statistic, Tabs, Form, Input, Select, DatePicker,
  Spin, Upload, Checkbox, InputNumber, message
} from 'antd';
import {
  UserOutlined, EditOutlined, SaveOutlined, CameraOutlined,
  MailOutlined, PhoneOutlined, CalendarOutlined, SettingOutlined,
  TrophyOutlined, PlusOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { 
  userService, 
  UserProfile, 
  TravelPreference, 
  TravelStyle, 
  HotelClass, 
  TransportPreference,
  UpdateUserProfileDto,
  CreateTravelPreferenceDto
} from '../../services/user.service';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

export const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [preferencesForm] = Form.useForm();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<TravelPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Set form values when profile is loaded
  useEffect(() => {
    if (profile && form && editing) {
      console.log('Setting form values with profile:', profile);
      try {
        form.setFieldsValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
          defaultBudgetMin: profile.defaultBudgetMin,
          defaultBudgetMax: profile.defaultBudgetMax,
          preferences: profile.preferences
        });
        console.log('Form values after setting:', form.getFieldsValue());
      } catch (error) {
        console.warn('Error setting form values:', error);
      }
    }
  }, [profile, form, editing]);

  const fetchUserProfile = async () => {
    if (!user) {
      console.log('No user context available');
      return;
    }
    
    console.log('User context:', user);
    console.log('Attempting to fetch profile for email:', user.email);
    console.log('User ID from context:', user.id);
    
    setLoading(true);
    try {
      // First, try to fetch user profile by email
      let profile;
      let profileFound = false;
      
      try {
        profile = await userService.getUserByEmail(user.email);
        console.log('Raw API response for getUserByEmail:', profile);
        
        // Check if the response indicates user not found
        if (profile && typeof profile === 'object' && 'message' in profile && profile.message === 'User not found') {
          console.log('getUserByEmail returned "User not found"');
          profileFound = false;
        } else if (profile && profile.id) {
          console.log('Successfully fetched profile by email:', profile);
          profileFound = true;
        }
      } catch (error) {
        console.log('getUserByEmail failed, will try by ID next');
        profileFound = false;
      }
      
      // If not found by email, try by ID
      if (!profileFound && user.id) {
        try {
          const profileById = await userService.getUserById(user.id);
          console.log('Raw API response for getUserById:', profileById);
          
          if (profileById && typeof profileById === 'object' && 'message' in profileById && profileById.message === 'User not found') {
            console.log('getUserById returned "User not found"');
            profileFound = false;
          } else if (profileById && profileById.id) {
            console.log('Successfully fetched profile by ID:', profileById);
            profile = profileById;
            profileFound = true;
          }
        } catch (error) {
          console.log('getUserById also failed');
          profileFound = false;
        }
      }
      
      // If user not found in User Service, create profile using auth context data
      if (!profileFound) {
        console.log('User not found in User Service, creating new profile from auth context');
        try {
          const createUserData = {
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
          };
          
          console.log('Creating user profile with data:', createUserData);
          const newProfile = await userService.createUser(createUserData);
          console.log('Successfully created new user profile:', newProfile);
          profile = newProfile;
          profileFound = true;
          
          // For newly created profile, set empty preferences immediately
          setPreferences([]);
          message.success('Chào mừng! Hồ sơ của bạn đã được thiết lập thành công.');
        } catch (createError) {
          console.error('Failed to create user profile:', createError);
          // Fallback to using auth context data directly for display
          profile = {
            id: user.id,
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          } as UserProfile;
          console.log('Using auth context data as fallback profile:', profile);
          setPreferences([]);
          message.warning('Sử dụng dữ liệu hồ sơ tạm thời. Một số tính năng có thể bị hạn chế.');
        }
      } else if (profile) {
        // Only fetch preferences for existing profiles
        console.log('Fetching preferences for existing profile:', profile.id);
        try {
          const preferences = await userService.getTravelPreferences(profile.id);
          console.log('Retrieved preferences:', preferences);
          setPreferences(preferences || []);
        } catch (prefError) {
          console.log('Failed to fetch preferences, using empty array:', prefError);
          setPreferences([]);
        }
      }
      
      if (profile) {
        setProfile(profile);
      }
      
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      message.error('Không thể tải hồ sơ');
      setPreferences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values: any) => {
    if (!profile) return;

    setUpdating(true);
    try {
      console.log('Updating profile with values:', values);
      const updateData: UpdateUserProfileDto = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined,
        defaultBudgetMin: values.defaultBudgetMin,
        defaultBudgetMax: values.defaultBudgetMax,
        preferences: values.preferences
      };

      console.log('Sending update data:', updateData);
      const updatedProfile = await userService.updateUser(profile.id, updateData);
      console.log('Profile updated successfully:', updatedProfile);
      
      setProfile(updatedProfile);
      setEditing(false);
      message.success('Hồ sơ đã được cập nhật thành công!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update profile';
      message.error(`Cập nhật thất bại: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleCreatePreference = async (values: any) => {
    if (!profile) return;

      console.log('Form values for new preference:', values);

    try {
      // Backend expects these exact fields with correct types
      const preferenceData = {
        userProfileId: profile.id,  // Required as string
        travelStyle: values.travelStyle,
        preferredHotelClass: values.preferredHotelClass, // Should be string enum (economy, comfort, premium, luxury)
        preferredTransport: values.preferredTransport,
        preferredAirlines: [],
        dietaryRestrictions: [],
        accessibilityNeeds: [],
        interests: []
      };

      console.log('Preference data to be sent:', preferenceData);
      console.log('Profile ID being used:', profile.id);      const newPreference = await userService.createTravelPreferences(profile.id, preferenceData as CreateTravelPreferenceDto);
      setPreferences([...preferences, newPreference]);
      preferencesForm.resetFields();
      message.success('Sở thích du lịch đã được thêm thành công!');
    } catch (error: any) {
      console.error('Error creating preference:', error);
      console.error('Error response:', error?.response?.data);
      
      // Extract detailed validation errors
      const responseData = error?.response?.data;
      if (responseData && Array.isArray(responseData.message)) {
        console.error('Validation errors:', responseData.message);
        const validationErrors = responseData.message;
        message.error(`Lỗi xác thực: ${validationErrors.join(', ')}`);
      } else {
        const errorMessage = responseData?.message || error?.message || 'Failed to add travel preference';
        message.error(`Không thể thêm sở thích: ${errorMessage}`);
      }
    }
  };

  const formatDate = (date: Date | string) => {
    return dayjs(date).format('MMM DD, YYYY');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải hồ sơ...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Tạo hồ sơ của bạn</Title>
        <Paragraph>Bạn cần tạo hồ sơ để bắt đầu.</Paragraph>
        <Button type="primary" size="large">
          Tạo hồ sơ
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row align="middle">
          <Col>
            <Avatar 
              size={80} 
              src={profile.avatar}
              icon={<UserOutlined />}
              style={{ marginRight: 16 }}
            />
          </Col>
          <Col flex={1}>
            <Title level={2} style={{ margin: 0 }}>
              {userService.getFullName(profile)}
            </Title>
            <Text type="secondary">{profile.email}</Text>
            <div style={{ marginTop: 8 }}>
              <Space>
                <Tag color="blue">
                  Thành viên từ {formatDate(profile.createdAt)}
                </Tag>
                {profile.isActive && <Tag color="green">Hoạt động</Tag>}
              </Space>
            </div>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => {
                if (profile && form) {
                  form.setFieldsValue({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    phone: profile.phone,
                    dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
                    defaultBudgetMin: profile.defaultBudgetMin,
                    defaultBudgetMax: profile.defaultBudgetMax,
                    preferences: profile.preferences
                  });
                }
                setEditing(true);
              }}
            >
              Chỉnh sửa hồ sơ
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Sở thích du lịch"
              value={preferences.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Khoảng ngân sách"
              value={userService.getBudgetDisplay(profile)}
              valueStyle={{ color: '#52c41a' }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Độ hoàn thành hồ sơ"
              value={85}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'profile',
            label: 'Thông tin hồ sơ',
            children: (
              <Card title="Thông tin cá nhân">
                {editing ? (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateProfile}
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="firstName"
                          label="Tên"
                          rules={[
                            { required: true, message: 'Vui lòng nhập tên của bạn' },
                            { min: 2, message: 'Tên phải có ít nhất 2 ký tự' }
                          ]}
                        >
                          <Input placeholder="Nhập tên của bạn" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="lastName"
                          label="Họ"
                          rules={[
                            { required: true, message: 'Vui lòng nhập họ của bạn' },
                            { min: 2, message: 'Họ phải có ít nhất 2 ký tự' }
                          ]}
                        >
                          <Input placeholder="Nhập họ của bạn" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="phone"
                          label="Số điện thoại"
                          rules={[
                            { pattern: /^[+]?[\d\s\-\(\)]+$/, message: 'Vui lòng nhập số điện thoại hợp lệ' }
                          ]}
                        >
                          <Input placeholder="Nhập số điện thoại của bạn" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="dateOfBirth"
                          label="Ngày sinh"
                        >
                          <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày sinh" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="defaultBudgetMin"
                          label="Ngân sách tối thiểu"
                          rules={[
                            { type: 'number', min: 0, message: 'Ngân sách phải là số dương' }
                          ]}
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Ngân sách tối thiểu"
                            prefix="$"
                            min={0}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="defaultBudgetMax"
                          label="Ngân sách tối đa"
                          rules={[
                            { type: 'number', min: 0, message: 'Ngân sách phải là số dương' },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value || !getFieldValue('defaultBudgetMin') || value >= getFieldValue('defaultBudgetMin')) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(new Error('Ngân sách tối đa phải lớn hơn ngân sách tối thiểu'));
                              },
                            })
                          ]}
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Ngân sách tối đa"
                            prefix="$"
                            min={0}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider />

                    <Space>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        icon={<SaveOutlined />}
                        loading={updating}
                        disabled={updating}
                      >
                        {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </Button>
                      <Button 
                        onClick={() => setEditing(false)}
                        disabled={updating}
                      >
                        Hủy
                      </Button>
                    </Space>
                  </Form>
                ) : (
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Tên">
                      {(() => {
                        console.log('Profile firstName in UI:', profile.firstName);
                        return profile.firstName || 'Chưa cung cấp';
                      })()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Họ">
                      {(() => {
                        console.log('Profile lastName in UI:', profile.lastName);
                        return profile.lastName || 'Chưa cung cấp';
                      })()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      <Space>
                        <MailOutlined />
                        {profile.email}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      <Space>
                        <PhoneOutlined />
                        {profile.phone || 'Chưa cung cấp'}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">
                      <Space>
                        <CalendarOutlined />
                        {profile.dateOfBirth ? formatDate(profile.dateOfBirth) : 'Chưa cung cấp'}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Khoảng ngân sách">
                      {userService.getBudgetDisplay(profile)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thành viên từ">
                      {formatDate(profile.createdAt)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cập nhật lần cuối">
                      {formatDate(profile.updatedAt)}
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </Card>
            )
          },
          {
            key: 'preferences',
            label: 'Sở thích du lịch',
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {/* Add New Preference */}
                <Card title="Thêm sở thích du lịch" size="small">
                  <Form
                    form={preferencesForm}
                    layout="vertical"
                    onFinish={handleCreatePreference}
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="travelStyle"
                          label="Kiểu du lịch"
                          rules={[{ required: true, message: 'Vui lòng chọn kiểu du lịch' }]}
                        >
                          <Select placeholder="Chọn kiểu du lịch">
                            {Object.values(TravelStyle).map(style => (
                              <Option key={style} value={style}>
                                {userService.getTravelStyleDisplay(style)}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="preferredHotelClass"
                          label="Hạng khách sạn"
                          rules={[{ required: true, message: 'Vui lòng chọn hạng khách sạn' }]}
                        >
                          <Select placeholder="Chọn hạng khách sạn">
                            {Object.values(HotelClass).map(cls => (
                              <Option key={cls} value={cls}>
                                {userService.getHotelClassDisplay(cls as HotelClass)}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="preferredTransport"
                          label="Phương tiện yêu thích"
                          rules={[{ required: true, message: 'Vui lòng chọn phương tiện yêu thích' }]}
                        >
                          <Select placeholder="Chọn phương tiện">
                            {Object.values(TransportPreference).map(transport => (
                              <Option key={transport} value={transport}>
                                {transport.charAt(0).toUpperCase() + transport.slice(1).replace('_', ' ')}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          name="interests"
                          label="Sở thích"
                        >
                          <Checkbox.Group>
                            <Row gutter={[8, 8]}>
                              <Col><Checkbox value="culture">Văn hóa & Lịch sử</Checkbox></Col>
                              <Col><Checkbox value="food">Ẩm thực & Đặc sản</Checkbox></Col>
                              <Col><Checkbox value="nature">Thiên nhiên & Hoạt động ngoài trời</Checkbox></Col>
                              <Col><Checkbox value="adventure">Thể thao mạo hiểm</Checkbox></Col>
                              <Col><Checkbox value="nightlife">Cuộc sống về đêm</Checkbox></Col>
                              <Col><Checkbox value="shopping">Mua sắm</Checkbox></Col>
                              <Col><Checkbox value="art">Nghệ thuật & Bảo tàng</Checkbox></Col>
                              <Col><Checkbox value="photography">Chụp ảnh</Checkbox></Col>
                            </Row>
                          </Checkbox.Group>
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                      Thêm sở thích
                    </Button>
                  </Form>
                </Card>

                {/* Existing Preferences */}
                {preferences.length > 0 ? (
                  <div>
                    <Title level={4}>Các sở thích du lịch của bạn</Title>
                    <Row gutter={[16, 16]}>
                      {preferences.map((preference) => (
                        <Col xs={24} md={12} lg={8} key={preference.id}>
                          <Card size="small">
                            <div style={{ marginBottom: 8 }}>
                              <Tag color="blue">
                                {userService.getTravelStyleDisplay(preference.travelStyle)}
                              </Tag>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                              <Text strong>Khách sạn: </Text>
                              {userService.getHotelClassDisplay(preference.preferredHotelClass)}
                            </div>
                            <div style={{ marginBottom: 8 }}>
                              <Text strong>Phương tiện: </Text>
                              {preference.preferredTransport.replace('_', ' ')}
                            </div>
                            {preference.interests && preference.interests.length > 0 && (
                              <div>
                                <Text strong>Sở thích: </Text>
                                {preference.interests.join(', ')}
                              </div>
                            )}
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                ) : (
                  <Card>
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <Title level={4} type="secondary">Chưa có sở thích du lịch</Title>
                      <Paragraph type="secondary">
                        Thêm các sở thích du lịch của bạn để giúp chúng tôi cung cấp các đề xuất tốt hơn.
                      </Paragraph>
                    </div>
                  </Card>
                )}
              </Space>
            )
          },
          {
            key: 'settings',
            label: 'Cài đặt',
            children: (
              <Card title="Cài đặt tài khoản">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Trạng thái tài khoản">
                    <Tag color={profile.isActive ? 'green' : 'red'}>
                      {profile.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Xác minh Email">
                    <Tag color="green">Đã xác minh</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Xác thực hai yếu tố">
                    <Tag color="orange">Chưa bật</Tag>
                    <Button type="link" size="small">Bật</Button>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )
          }
        ]}
      />
    </div>
  );
};