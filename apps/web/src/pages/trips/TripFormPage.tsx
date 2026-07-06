import React, { useState, useEffect } from 'react';
import {
  Form, Input, DatePicker, InputNumber, Select, Button, Card, Row, Col,
  Typography, Space, Divider, Tag, Checkbox, Spin, Steps, App
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined,
  CalendarOutlined, DollarOutlined, UserOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService, CreateTripDto, UpdateTripDto, Trip } from '../../services/trip.service';
import { useAuth } from '../../contexts/AuthContext';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Step } = Steps;

export const TripFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  // State to store all form data across steps
  const [formData, setFormData] = useState({
    name: '',
    dates: null as [dayjs.Dayjs, dayjs.Dayjs] | null,
    numberOfPeople: 1,
    destination: '',
    budgetMax: 0,
    currency: 'USD',
    preferences: {
      pace: 'moderate' as 'relaxed' | 'moderate' | 'packed',
      interests: [] as string[],
      mustSee: [] as string[],
      avoidances: [] as string[]
    }
  });
  
  const isEditing = !!id;
  const isCreating = !isEditing;

  // Show loading if user is not loaded yet
  if (!user) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading...</div>
      </div>
    );
  }

  useEffect(() => {
    if (isEditing && id) {
      fetchTrip();
    } else if (isCreating) {
      // Set default values for new trip
      form.setFieldsValue({
        currency: 'USD',
        numberOfPeople: 1,
        preferences: {
          pace: 'moderate',
          interests: [],
          mustSee: [],
          avoidances: []
        }
      });
    }
  }, [id, isEditing, form]);

  // Sync form values with formData when step changes
  useEffect(() => {
    // Set form values based on current step and saved formData
    const currentStepValues: any = {};
    
    switch (currentStep) {
      case 0:
        currentStepValues.name = formData.name;
        currentStepValues.dates = formData.dates;
        currentStepValues.numberOfPeople = formData.numberOfPeople;
        currentStepValues.destination = formData.destination;
        break;
      case 1:
        currentStepValues.budgetMax = formData.budgetMax;
        currentStepValues.currency = formData.currency;
        break;
      case 2:
        currentStepValues.preferences = formData.preferences;
        break;
    }
    
    // Only set if we have data to avoid clearing existing form values
    const hasData = Object.values(currentStepValues).some(value => 
      value !== null && value !== undefined && value !== '' && value !== 0
    );
    
    if (hasData) {
      form.setFieldsValue(currentStepValues);
    }
  }, [currentStep, formData, form]);

  const fetchTrip = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const tripData = await tripService.getTripById(id);
      setTrip(tripData);
      
      // Update formData state with trip data
      const tripFormData = {
        name: tripData.name,
        dates: [dayjs(tripData.startDate), dayjs(tripData.endDate)] as [dayjs.Dayjs, dayjs.Dayjs],
        destination: `${tripData.destination.city}, ${tripData.destination.country}`,
        numberOfPeople: tripData.participants,
        budgetMax: tripData.budget.total,
        currency: tripData.budget.currency,
        preferences: tripData.preferences || {
          pace: 'moderate' as 'moderate',
          interests: [],
          mustSee: [],
          avoidances: []
        }
      };
      
      setFormData(tripFormData);
      
      // Convert trip data to form values for current step
      const formValues = {
        name: tripData.name,
        dates: [dayjs(tripData.startDate), dayjs(tripData.endDate)],
        destination: `${tripData.destination.city}, ${tripData.destination.country}`,
        numberOfPeople: tripData.participants,
        budgetMax: tripData.budget.total,
        currency: tripData.budget.currency,
        preferences: tripData.preferences || {
          pace: 'moderate',
          interests: [],
          mustSee: [],
          avoidances: []
        }
      };
      
      form.setFieldsValue(formValues);
    } catch (error) {
      console.error('Error fetching trip:', error);
      message.error('Failed to load trip details');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    if (!user) {
      message.error('You must be logged in to create a trip');
      return;
    }

    // Try different possible id fields from user object
    const userId = user.id || (user as any).userId || (user as any)._id;
    
    if (!userId) {
      console.error('User object:', user);
      message.error('User ID is missing. Please try logging in again.');
      return;
    }

    // Merge final form values with saved formData
    const finalData = {
      ...formData,
      ...values // Current step values
    };

    console.log('User:', user);
    console.log('User ID used:', userId);
    console.log('Final form data:', finalData);
    console.log('Dates from state:', finalData.dates);

    setLoading(true);
    try {
      // Check if dates exist
      if (!finalData.dates || !Array.isArray(finalData.dates) || finalData.dates.length !== 2) {
        console.error('Invalid dates:', finalData.dates);
        message.error('Please select valid start and end dates');
        setLoading(false);
        return;
      }

      const [startDate, endDate] = finalData.dates;
      
      if (isEditing && trip) {
        // Update existing trip
        const updateData: UpdateTripDto = {
          name: finalData.name,
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          numberOfPeople: finalData.numberOfPeople || 1,
          budgetMax: finalData.budgetMax || 0,
          currency: finalData.currency || 'USD',
          preferences: finalData.preferences || {
            pace: 'moderate',
            interests: [],
            mustSee: [],
            avoidances: []
          }
        };
        
        await tripService.updateTrip(trip.id, updateData);
        message.success('Trip updated successfully!');
        navigate(`/trips/${trip.id}`);
      } else {
        // Create new trip
        const createData: CreateTripDto = {
          userId: userId, // Use the extracted userId
          name: finalData.name,
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          numberOfPeople: finalData.numberOfPeople || 1,
          budgetMax: finalData.budgetMax || 0,
          currency: finalData.currency || 'USD',
          preferences: finalData.preferences || {
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
      }
    } catch (error: any) {
      console.error('Error saving trip:', error);
      message.error(error.response?.data?.message || 'Failed to save trip');
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const nextStep = async () => {
    try {
      // Get current form values to debug
      const currentValues = form.getFieldsValue();
      console.log('Current form values:', currentValues);
      
      // Validate current step fields
      const currentStepFields = getCurrentStepFields();
      console.log('Validating fields:', currentStepFields);
      
      await form.validateFields(currentStepFields);
      
      // Save current step data to state
      const updatedFormData = { ...formData };
      
      switch (currentStep) {
        case 0:
          updatedFormData.name = currentValues.name || formData.name;
          updatedFormData.dates = currentValues.dates || formData.dates;
          updatedFormData.numberOfPeople = currentValues.numberOfPeople || formData.numberOfPeople;
          updatedFormData.destination = currentValues.destination || formData.destination;
          break;
        case 1:
          updatedFormData.budgetMax = currentValues.budgetMax || formData.budgetMax;
          updatedFormData.currency = currentValues.currency || formData.currency;
          break;
        case 2:
          updatedFormData.preferences = currentValues.preferences || formData.preferences;
          break;
      }
      
      console.log('Updated form data:', updatedFormData);
      setFormData(updatedFormData);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Please fill all required fields in this step');
    }
  };

  const getCurrentStepFields = () => {
    switch (currentStep) {
      case 0:
        return ['name', 'dates', 'numberOfPeople', 'destination'];
      case 1:
        return ['budgetMax', 'currency'];
      case 2:
        return []; // Preferences are optional
      default:
        return [];
    }
  };

  const steps = [
    {
      title: 'Basic Info',
      content: (
        <Card title="Trip Information">
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
            
            <Col xs={24} md={12}>
              <Form.Item
                name="dates"
                label="Travel Dates"
                rules={[{ required: true, message: 'Please select travel dates' }]}
              >
                <RangePicker 
                  size="large"
                  style={{ width: '100%' }}
                  disabledDate={disabledDate}
                  format="MMM DD, YYYY"
                  onChange={(dates, dateStrings) => {
                    console.log('RangePicker onChange:', dates, dateStrings);
                  }}
                />
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
            
            <Col xs={24}>
              <Form.Item
                name="destination"
                label="Destination"
                rules={[{ required: true, message: 'Please enter destination' }]}
              >
                <Input 
                  placeholder="e.g., Tokyo, Japan" 
                  size="large"
                  prefix={<EnvironmentOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      )
    },
    {
      title: 'Budget',
      content: (
        <Card title="Budget Planning">
          <Row gutter={[16, 16]}>
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
                  <Option value="JPY">JPY - Japanese Yen</Option>
                  <Option value="VND">VND - Vietnamese Dong</Option>
                  <Option value="CNY">CNY - Chinese Yuan</Option>
                  <Option value="KRW">KRW - Korean Won</Option>
                  <Option value="THB">THB - Thai Baht</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24}>
              <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '6px' }}>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  💡 <strong>Budget Tip:</strong> Consider including a 10-20% buffer for unexpected expenses.
                  Your budget will be automatically distributed across flights, accommodation, activities, food, and transport.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      )
    },
    {
      title: 'Preferences',
      content: (
        <Card title="Travel Preferences">
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                name={['preferences', 'pace']}
                label="Travel Pace"
              >
                <Select size="large" placeholder="How fast-paced do you want this trip?">
                  <Option value="relaxed">Relaxed - Take it slow and easy</Option>
                  <Option value="moderate">Moderate - Balanced mix of activity and rest</Option>
                  <Option value="packed">Packed - See and do as much as possible</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24}>
              <Form.Item
                name={['preferences', 'interests']}
                label="Interests"
              >
                <Checkbox.Group>
                  <Row gutter={[8, 8]}>
                    <Col><Checkbox value="culture">Culture & History</Checkbox></Col>
                    <Col><Checkbox value="food">Food & Cuisine</Checkbox></Col>
                    <Col><Checkbox value="nature">Nature & Outdoors</Checkbox></Col>
                    <Col><Checkbox value="adventure">Adventure Sports</Checkbox></Col>
                    <Col><Checkbox value="nightlife">Nightlife & Entertainment</Checkbox></Col>
                    <Col><Checkbox value="shopping">Shopping</Checkbox></Col>
                    <Col><Checkbox value="art">Art & Museums</Checkbox></Col>
                    <Col><Checkbox value="architecture">Architecture</Checkbox></Col>
                    <Col><Checkbox value="photography">Photography</Checkbox></Col>
                    <Col><Checkbox value="wellness">Wellness & Spa</Checkbox></Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </Col>
            
            <Col xs={24}>
              <Form.Item
                name={['preferences', 'mustSee']}
                label="Must-See Places (one per line)"
              >
                <TextArea 
                  rows={3}
                  placeholder="e.g.&#10;Tokyo Tower&#10;Senso-ji Temple&#10;Mount Fuji"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24}>
              <Form.Item
                name={['preferences', 'avoidances']}
                label="Things to Avoid (one per line)"
              >
                <TextArea 
                  rows={2}
                  placeholder="e.g.&#10;Crowded places&#10;Spicy food&#10;High altitudes"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      )
    }
  ];

  if (loading && isEditing) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading trip details...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/trips')}
          style={{ marginBottom: 16 }}
        >
          Back to Trips
        </Button>
        
        <Title level={2}>
          {isEditing ? `Edit Trip: ${trip?.name || 'Loading...'}` : 'Plan New Trip'}
        </Title>
        <Paragraph type="secondary">
          {isEditing 
            ? 'Update your trip details and preferences.' 
            : 'Create a new travel plan with all the details you need.'
          }
        </Paragraph>
      </div>

      {/* Progress Steps */}
      <Card style={{ marginBottom: 24 }}>
        <Steps current={currentStep} onChange={handleStepChange}>
          {steps.map((step) => (
            <Step key={step.title} title={step.title} />
          ))}
        </Steps>
      </Card>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        scrollToFirstError
      >
        {/* Step Content */}
        <div style={{ marginBottom: 24 }}>
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </Button>
              )}
            </div>
            
            <div>
              {currentStep < steps.length - 1 ? (
                <Button 
                  type="primary" 
                  onClick={nextStep}
                >
                  Next
                </Button>
              ) : (
                <Space>
                  <Button onClick={() => navigate('/trips')}>
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                    size="large"
                  >
                    {isEditing ? 'Update Trip' : 'Create Trip'}
                  </Button>
                </Space>
              )}
            </div>
          </div>
        </Card>
      </Form>
    </div>
  );
};