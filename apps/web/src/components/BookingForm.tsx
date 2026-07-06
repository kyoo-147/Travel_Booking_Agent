import React, { useState } from 'react';
import { Form, Input, DatePicker, InputNumber, Select, Radio, Checkbox, Button, Card, Divider, Typography, Space, message } from 'antd';
import { UserContactInfo, TravelIntent, BookingRequest } from '../types/booking.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface BookingFormProps {
    onSubmit: (data: BookingRequest) => void;
    loading?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, loading = false }) => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        // Transform Form values to Booking Request Interface
        try {
            const {
                // User Info
                displayName, contactPhone, contactEmail, communicationStyle,
                // Hotel Contact
                hotelName, hotelPhone,
                // Trip Info
                destination, dates, guests, rooms, urgency, budgetMin, budgetMax, tripBudget, accommodationType,
                // Amenities
                wifi, ac, privateBathroom, pool, seaView, breakfast,
                // Other
                note
            } = values;

            const bookingData: BookingRequest = {
                userContact: {
                    displayName,
                    contactPhone,
                    contactEmail,
                    preferredLanguage: 'vi', // Default for this MVP
                    communicationStyle: communicationStyle || 'neutral'
                },
                hotelContact: {
                    name: hotelName,
                    zaloPhone: hotelPhone
                },
                tripDetails: {
                    destination,
                    hotelContactPhone: hotelPhone, // Keep for backward compatibility
                    checkInDate: dates ? dates[0].format('YYYY-MM-DD') : '',
                    checkOutDate: dates ? dates[1].format('YYYY-MM-DD') : '',
                    numberOfGuests: guests,
                    numberOfRooms: rooms,
                    urgencyLevel: urgency,
                    budgetMinPerNight: budgetMin,
                    budgetMaxPerNight: budgetMax,
                    totalTripBudget: tripBudget, // 🆕 NEW: Total budget for entire trip
                    accommodationType,
                    paymentMethod: 'bank_transfer', // Default assumption for MVP
                    readyToBook: true,
                    mustHaveAmenities: {
                        wifi: !!wifi,
                        airConditioner: !!ac,
                        privateBathroom: !!privateBathroom
                    },
                    preferredAmenities: {
                        swimmingPool: !!pool,
                        seaView: !!seaView,
                        breakfastIncluded: !!breakfast,
                        parking: false,
                        elevator: false,
                        petFriendly: false
                    },
                    note
                }
            };

            console.log('Form Submitted Payload:', bookingData);
            onSubmit(bookingData);
        } catch (error) {
            console.error('Form transform error:', error);
            message.error('Có lỗi xử lý dữ liệu form');
        }
    };

    return (
        <Card
            style={{
                maxWidth: 600,
                margin: '0 auto',
                borderRadius: 16,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
            }}
            bodyStyle={{ padding: '24px' }}
        >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0, color: '#1d4ed8' }}>📋 Phiếu Yêu Cầu Đặt Phòng</Title>
                <Text type="secondary" style={{ fontSize: 13 }}>Điền thông tin để Agent hỗ trợ bạn tìm phòng ngay lập tức</Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    urgency: 'NORMAL',
                    rooms: 1,
                    guests: 2,
                    communicationStyle: 'casual',
                    accommodationType: 'hotel',
                    wifi: true,
                    ac: true,
                    privateBathroom: true
                }}
                size="middle"
            >
                {/* SECTION 1: THÔNG TIN LIÊN HỆ */}
                <Divider orientation="left" style={{ borderColor: '#bfdbfe', color: '#1e40af', fontSize: 14 }}>1. Thông tin liên hệ</Divider>

                <Form.Item label="Họ tên (để xưng hô)" name="displayName">
                    <Input placeholder="Ví dụ: Anh Nam, Chị Lan..." />
                </Form.Item>

                <Space style={{ display: 'flex', marginBottom: 8 }} align="start">
                    <Form.Item
                        label="Số điện thoại (Zalo)"
                        name="contactPhone"
                        rules={[{ required: true, message: 'Cần SĐT để liên hệ' }]}
                        style={{ flex: 1 }}
                    >
                        <Input placeholder="09xxxxxxx" />
                    </Form.Item>

                    <Form.Item
                        label="Email nhận booking"
                        name="contactEmail"
                        rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}
                        style={{ flex: 1 }}
                    >
                        <Input placeholder="email@example.com" />
                    </Form.Item>
                </Space>

                <Form.Item label="Phong cách giao tiếp mong muốn" name="communicationStyle">
                    <Radio.Group buttonStyle="solid">
                        <Radio.Button value="casual">Thân thiện, trẻ trung</Radio.Button>
                        <Radio.Button value="neutral">Bình thường</Radio.Button>
                        <Radio.Button value="polite">Lịch sự, trang trọng</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                {/* SECTION 2: NHU CẦU CHUYẾN ĐI */}
                <Divider orientation="left" style={{ borderColor: '#bfdbfe', color: '#1e40af', fontSize: 14 }}>2. Chi tiết chuyến đi</Divider>

                <Form.Item
                    label="Điểm đến"
                    name="destination"
                    rules={[{ required: true, message: 'Bạn muốn đi đâu?' }]}
                >
                    <Input placeholder="Ví dụ: Đà Nẵng, Quận 1 HCM, Sapa..." prefix={<span style={{ marginRight: 4 }}>📍</span>} />
                </Form.Item>

                <Form.Item
                    label="Tên khách sạn"
                    name="hotelName"
                    rules={[{ required: true, message: 'Vui lòng nhập tên khách sạn' }]}
                    tooltip="Agent sẽ liên hệ với khách sạn này để đặt phòng tự động"
                >
                    <Input placeholder="Ví dụ: Khách sạn ABC, Resort XYZ..." prefix={<span style={{ marginRight: 4 }}>🏨</span>} />
                </Form.Item>

                <Form.Item
                    label="Zalo/SĐT khách sạn"
                    name="hotelPhone"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại Zalo khách sạn' }]}
                    tooltip="Agent sẽ nhắn tin qua Zalo cho số này để đàm phán đặt phòng"
                >
                    <Input placeholder="09xxxxxxxx" prefix={<span style={{ marginRight: 4 }}>📞</span>} />
                </Form.Item>

                <Form.Item
                    label="Ngày đi - Ngày về"
                    name="dates"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                >
                    <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder={['Ngày nhận phòng', 'Ngày trả phòng']} />
                </Form.Item>

                <Space style={{ display: 'flex', marginBottom: 8 }} align="start">
                    <Form.Item label="Số khách" name="guests" style={{ flex: 1 }}>
                        <InputNumber min={1} max={50} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Số lượng phòng" name="rooms" style={{ flex: 1 }}>
                        <InputNumber min={1} max={20} style={{ width: '100%' }} />
                    </Form.Item>
                </Space>

                <Form.Item label="Loại hình lưu trú" name="accommodationType">
                    <Select>
                        <Option value="hotel">Khách sạn (Hotel)</Option>
                        <Option value="resort">Resort / Nghỉ dưỡng</Option>
                        <Option value="homestay">Homestay / Căn hộ</Option>
                        <Option value="any">Bất kỳ (Tối ưu nhất)</Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Mức độ gấp" name="urgency">
                    <Radio.Group>
                        <Radio value="NORMAL">Bình thường</Radio>
                        <Radio value="URGENT" style={{ color: '#ef4444', fontWeight: 500 }}>🔥 GẤP (Cần phòng ngay)</Radio>
                    </Radio.Group>
                </Form.Item>

                {/* SECTION 3: NGÂN SÁCH & TIỆN ÍCH */}
                <Divider orientation="left" style={{ borderColor: '#bfdbfe', color: '#1e40af', fontSize: 14 }}>3. Ngân sách & Tiện ích</Divider>

                <Space style={{ display: 'flex' }} align="start">
                    <Form.Item
                        label="Ngân sách thấp nhất/đêm"
                        name="budgetMin"
                        rules={[{ required: true, message: 'Nhập số 0 nếu không giới hạn' }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
                            addonAfter="VND"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Ngân sách cao nhất/đêm"
                        name="budgetMax"
                        rules={[{ required: true, message: 'Nhập ngân sách tối đa' }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
                            addonAfter="VND"
                        />
                    </Form.Item>
                </Space>

                <Form.Item
                    label="Ngân sách TỔNG cho chuyến đi"
                    name="tripBudget"
                    rules={[{ required: true, message: 'Nhập tổng ngân sách chuyến đi' }]}
                    tooltip="Tổng chi phí bạn dự kiến cho cả chuyến (bao gồm phòng, vé, ăn uống, vui chơi...)"
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
                        addonAfter="VND"
                        placeholder="Ví dụ: 5,000,000"
                    />
                </Form.Item>

                <Form.Item label="Tiện ích BẮT BUỘC (Must-have)" style={{ marginBottom: 12 }}>
                    <Space wrap>
                        <Form.Item name="wifi" valuePropName="checked" noStyle><Checkbox>Wifi mạnh</Checkbox></Form.Item>
                        <Form.Item name="ac" valuePropName="checked" noStyle><Checkbox>Điều hòa</Checkbox></Form.Item>
                        <Form.Item name="privateBathroom" valuePropName="checked" noStyle><Checkbox>Vệ sinh khép kín</Checkbox></Form.Item>
                    </Space>
                </Form.Item>

                <Form.Item label="Tiện ích Ưu tiên (Nice-to-have)" style={{ marginBottom: 12 }}>
                    <Space wrap>
                        <Form.Item name="pool" valuePropName="checked" noStyle><Checkbox>Bể bơi</Checkbox></Form.Item>
                        <Form.Item name="seaView" valuePropName="checked" noStyle><Checkbox>View biển</Checkbox></Form.Item>
                        <Form.Item name="breakfast" valuePropName="checked" noStyle><Checkbox>Ăn sáng</Checkbox></Form.Item>
                    </Space>
                </Form.Item>

                <Form.Item label="Ghi chú thêm cho Agent" name="note">
                    <TextArea rows={2} placeholder="Ví dụ: Mình thích phòng tông màu sáng, cần yên tĩnh..." />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ background: 'linear-gradient(to right, #2563eb, #3b82f6)', border: 'none', height: 48, fontSize: 16, fontWeight: 600 }}>
                        🚀 Gửi yêu cầu đặt phòng
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};
