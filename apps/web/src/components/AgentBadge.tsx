import React from 'react';
import { Tag } from 'antd';
import { RobotOutlined } from '@ant-design/icons';

interface AgentBadgeProps {
    size?: 'small' | 'default';
    showIcon?: boolean;
}

/**
 * Badge component to indicate trips created by AI Agent
 */
export const AgentBadge: React.FC<AgentBadgeProps> = ({
    size = 'default',
    showIcon = true
}) => {
    return (
        <Tag
            color="blue"
            icon={showIcon ? <RobotOutlined /> : undefined}
            style={{
                fontSize: size === 'small' ? '12px' : '14px',
                fontWeight: 500
            }}
        >
            AI Agent Booking
        </Tag>
    );
};
