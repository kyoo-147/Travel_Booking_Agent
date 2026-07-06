import React from 'react';
import { Result, Button } from 'antd';
import { motion } from 'framer-motion';
import { ExclamationCircleOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';

interface ErrorBoundaryProps {
  error?: Error | null;
  title?: string;
  subtitle?: string;
  showHomeButton?: boolean;
  showRetryButton?: boolean;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  error,
  title = 'Có lỗi xảy ra',
  subtitle = 'Xin lỗi, đã có lỗi không mong muốn xảy ra.',
  showHomeButton = true,
  showRetryButton = true,
  onRetry,
  onGoHome,
}) => {
  const actions = [];

  if (showRetryButton && onRetry) {
    actions.push(
      <Button 
        key="retry" 
        type="primary" 
        icon={<ReloadOutlined />} 
        onClick={onRetry}
      >
        Thử lại
      </Button>
    );
  }

  if (showHomeButton && onGoHome) {
    actions.push(
      <Button 
        key="home" 
        icon={<HomeOutlined />} 
        onClick={onGoHome}
      >
        Về trang chủ
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        padding: '2rem',
      }}
    >
      <Result
        icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
        title={title}
        subTitle={subtitle}
        extra={actions.length > 0 ? actions : undefined}
      />
    </motion.div>
  );
};

export default ErrorBoundary;