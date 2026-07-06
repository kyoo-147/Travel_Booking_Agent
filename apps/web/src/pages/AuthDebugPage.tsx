import React from 'react';
import { Button, Card, Typography, Space, Divider } from 'antd';
import { clearAllAuthData, debugAuthState, isTokenExpired } from '../utils/auth.utils';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;

export const AuthDebugPage: React.FC = () => {
  const { user, tokens, logout } = useAuth();

  const handleClearAll = () => {
    clearAllAuthData();
    window.location.reload();
  };

  const handleDebugState = () => {
    debugAuthState();
  };

  const checkTokenExpiry = () => {
    if (tokens?.accessToken) {
      const expired = isTokenExpired(tokens.accessToken);
      console.log('Token expired:', expired);
      alert(`Token expired: ${expired}`);
    } else {
      alert('No token found');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Auth Debug Page</Title>
      
      <Card title="Current Auth State" style={{ marginBottom: '16px' }}>
        <Paragraph><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'Not logged in'}</Paragraph>
        <Paragraph><strong>Tokens:</strong> {tokens ? 'Present' : 'None'}</Paragraph>
        <Paragraph><strong>Is Authenticated:</strong> {user ? 'Yes' : 'No'}</Paragraph>
      </Card>

      <Card title="Debug Actions" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button onClick={handleDebugState} type="default">
            Debug Console Log
          </Button>
          <Button onClick={checkTokenExpiry} type="default">
            Check Token Expiry
          </Button>
          <Button onClick={handleClearAll} type="primary" danger>
            Clear All Auth Data & Reload
          </Button>
          <Button onClick={logout} type="default">
            Logout
          </Button>
        </Space>
      </Card>

      <Card title="localStorage Contents">
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify({
            auth_tokens: localStorage.getItem('auth_tokens'),
            user_profile: localStorage.getItem('user_profile'),
          }, null, 2)}
        </pre>
      </Card>
    </div>
  );
};