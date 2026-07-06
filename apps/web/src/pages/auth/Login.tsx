import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  Checkbox,
  Alert,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  FacebookOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { clearAllAuthData, debugAuthState } from '../../utils/auth.utils';
import type { LoginRequest } from '../../types/auth.types';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isDark } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);

      // Debug current state
      debugAuthState();

      // Clear all auth data first
      clearAllAuthData();

      console.log('Attempting login with:', values.email);
      await login(values.email, values.password);

      console.log('Login successful, redirecting to chat');
      // Redirect to chat
      navigate('/chat');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: '100%', maxWidth: 400 }}
      >
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 24,
              margin: '0 auto 16px',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
            }}
          >
            T
          </div>
          <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
            <span className="gradient-text">Chào Mừng Trở Lại</span>
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Đăng nhập vào tài khoản TravelAgent của bạn
          </Text>
        </motion.div>

        {/* Login Card */}
        <motion.div variants={cardVariants}>
          <Card
            className="glass-card shadow-soft"
            style={{
              borderRadius: 20,
              border: 'none',
              backdropFilter: 'blur(10px)',
            }}
            styles={{ body: { padding: 32 } }}
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 24 }}
              >
                <Alert
                  message={error}
                  type="error"
                  showIcon
                  style={{ borderRadius: 8 }}
                />
              </motion.div>
            )}

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              className="modern-form"
            >
              <Form.Item
                name="email"
                label="Địa chỉ Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Vui lòng nhập email hợp lệ!' },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#6366f1' }} />}
                  placeholder="Nhập email của bạn"
                  style={{ borderRadius: 8, height: 48 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#6366f1' }} />}
                  placeholder="Nhập mật khẩu"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                  style={{ borderRadius: 8, height: 48 }}
                />
              </Form.Item>

              <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                <Link
                  to="/forgot-password"
                  style={{ color: '#6366f1', textDecoration: 'none' }}
                >
                  Quên mật khẩu?
                </Link>
              </Row>

              <Form.Item style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    height: 48,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                </Button>
              </Form.Item>
            </Form>

            <Divider>
              <Text type="secondary">Hoặc đăng nhập với</Text>
            </Divider>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Row gutter={12}>
                <Col span={12}>
                  <Button
                    icon={<GoogleOutlined />}
                    block
                    style={{
                      height: 44,
                      borderRadius: 8,
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    }}
                  >
                    Google
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    icon={<FacebookOutlined />}
                    block
                    style={{
                      height: 44,
                      borderRadius: 8,
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    }}
                  >
                    Facebook
                  </Button>
                </Col>
              </Row>

              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Text type="secondary">
                  Chưa có tài khoản?{' '}
                  <Link
                    to="/register"
                    style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}
                  >
                    Đăng ký ngay
                  </Link>
                </Text>
              </div>
            </Space>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            textAlign: 'center',
            marginTop: 32,
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            © 2025 TravelAgent. Đã đăng ký bản quyền.
          </Text>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;