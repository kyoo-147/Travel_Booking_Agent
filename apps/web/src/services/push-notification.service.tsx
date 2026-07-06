import React from 'react';
import { notification } from 'antd';
import { UserAddOutlined, CheckCircleOutlined, BellOutlined, CarOutlined } from '@ant-design/icons';

// Configure notification globally
notification.config({
  placement: 'topRight',
  top: 70,
  duration: 4.5,
  maxCount: 3,
  rtl: false,
});

export interface PushNotificationOptions {
  type: 'invitation' | 'accepted' | 'general';
  title: string;
  message: string;
  onClick?: () => void;
  notificationType?: string;
}

export const showPushNotification = (options: PushNotificationOptions) => {
  const { type, title, message, onClick, notificationType } = options;
  
  const getIcon = () => {
    switch (type) {
      case 'invitation':
        return <UserAddOutlined style={{ color: '#1890ff', fontSize: '18px' }} />;
      case 'accepted':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />;
      case 'general':
        if (notificationType === 'trip_invitation') {
          return <CarOutlined style={{ color: '#52c41a', fontSize: '18px' }} />;
        }
        return <BellOutlined style={{ color: '#1890ff', fontSize: '18px' }} />;
      default:
        return <BellOutlined style={{ color: '#1890ff', fontSize: '18px' }} />;
    }
  };

  const notificationConfig = {
    message: title,
    description: message,
    icon: getIcon(),
    onClick: onClick || (() => {}),
    style: {
      cursor: onClick ? 'pointer' : 'default',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e8f4fd',
      backgroundColor: '#fff',
    },
    className: 'custom-notification',
  };

  switch (type) {
    case 'invitation':
      notification.info(notificationConfig);
      break;
    case 'accepted':
      notification.success(notificationConfig);
      break;
    case 'general':
      notification.open(notificationConfig);
      break;
    default:
      notification.info(notificationConfig);
  }
};

export default {
  showPushNotification,
};