import React, { useState } from 'react';
import {
  Form, Input, DatePicker, InputNumber, Select, Button, Card, Row, Col,
  Typography, Space, App
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { tripService, CreateTripDto } from '../../services/trip.service';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export const SimpleTripForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  const onFinish = async (values: any) => {
    if (!user) {
      message.error('You must be logged in to create a trip');
      return;
    }

    console.log('Simple form values:', values);
    console.log('Date range state:', dateRange);

    setLoading(true);
    try {
      // Use dateRange state instead of form values
      if (!dateRange || !dateRange[0] || !dateRange[1]) {
        console.error('Invalid dates from state:', dateRange);
        message.error('Please select valid start and end dates');
        setLoading(false);
        return;
      }

      const [startDate, endDate] = dateRange;
      
      const createData: CreateTripDto = {
        userId: user.id,
        name: values.name,
        description: values.destination,
        startDate: startDate!.format('YYYY-MM-DD'),
        endDate: endDate!.format('YYYY-MM-DD'),
        numberOfPeople: values.numberOfPeople || 1,
        budgetMax: values.budgetMax || 0,
        currency: values.currency || 'USD',
        preferences: {
          pace: 'moderate',
          interests: [],
          mustSee: [],
          avoidances: []
        }
      };
      
      console.log('Create data:', createData);
      const newTrip = await tripService.createTrip(createData);
      message.success('Trip created successfully!');
      navigate(`/trips/${newTrip.id}`);
    } catch (error: any) {
      console.error('Error saving trip:', error);
      message.error(error.response?.data?.message || 'Failed to save trip');
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current: any) => {
    return current && current < dayjs().endOf('day');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Create Simple Trip</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          currency: 'USD',
          numberOfPeople: 1
        }}
      >
        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                name="name"
                label="Trip Name"
                rules={[{ required: true, message: 'Please enter trip name' }]}
              >
                <Input placeholder="e.g., Summer Vacation in Japan" size="large" />
              </Form.Item>
            </Col>
            
            <Col xs={24}>
              <Form.Item
                label="Travel Dates"
                required
              >
                <RangePicker 
                  size="large"
                  style={{ width: '100%' }}
                  disabledDate={disabledDate}
                  format="MMM DD, YYYY"
                  value={dateRange}
                  onChange={(dates, dateStrings) => {
                    console.log('RangePicker onChange:', dates, dateStrings);
                    if (dates && dates.length === 2) {
                      setDateRange([dates[0], dates[1]]);
                    } else {
                      setDateRange([null, null]);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="destination"
                label="Destination"
                rules={[{ required: true, message: 'Please enter destination' }]}
              >
                <Input placeholder="e.g., Tokyo, Japan" size="large" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="numberOfPeople"
                label="Number of Travelers"
                rules={[{ required: true, message: 'Please enter number of travelers' }]}
              >
                <InputNumber 
                  min={1} 
                  max={20}
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="How many people?"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="budgetMax"
                label="Maximum Budget"
                rules={[{ required: true, message: 'Please enter your budget' }]}
              >
                <InputNumber
                  min={0}
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="Enter maximum budget"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="currency"
                label="Currency"
                rules={[{ required: true, message: 'Please select currency' }]}
              >
                <Select size="large" placeholder="Select currency">
                  <Option value="USD">USD - US Dollar</Option>
                  <Option value="EUR">EUR - Euro</Option>
                  <Option value="GBP">GBP - British Pound</Option>
                  <Option value="VND">VND - Vietnamese Dong</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={() => navigate('/trips')}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
              >
                Create Trip
              </Button>
            </Space>
          </div>
        </Card>
      </Form>
    </div>
  );
};