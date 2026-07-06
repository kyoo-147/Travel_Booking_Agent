import React from 'react';
import { Empty, Button } from 'antd';
import { motion } from 'framer-motion';
import { PlusOutlined, FileTextOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  title?: string;
  description?: string;
  image?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không có dữ liệu',
  description = 'Chưa có dữ liệu để hiển thị',
  image,
  actionText,
  onAction,
  style,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px',
        padding: '2rem',
        ...style,
      }}
    >
      <Empty
        image={image || <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
        imageStyle={{
          height: 60,
          marginBottom: 16,
        }}
        description={
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8, color: 'var(--ant-color-text)' }}>
              {title}
            </div>
            <div style={{ color: 'var(--ant-color-text-secondary)' }}>
              {description}
            </div>
          </div>
        }
      >
        {actionText && onAction && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={onAction}
            size="middle"
          >
            {actionText}
          </Button>
        )}
      </Empty>
    </motion.div>
  );
};

export default EmptyState;