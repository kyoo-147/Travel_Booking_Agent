import React from 'react';
import { Card, Steps } from 'antd';

interface BookingStatusCardProps {
    state: string;
    createdAt: string;
    completedAt?: string;
}

/**
 * Component to display booking progress through FSM states
 */
export const BookingStatusCard: React.FC<BookingStatusCardProps> = ({
    state,
    createdAt,
    completedAt
}) => {
    const stateSteps = [
        'INPUT_READY',
        'CONTACTING_HOTEL',
        'NEGOTIATING',
        'WAITING_USER_CONFIRM_PAYMENT',
        'CONFIRMED'
    ];

    const getCurrentStep = () => {
        if (state === 'CANCELLED') {
            return stateSteps.indexOf('NEGOTIATING'); // Show error at negotiating step
        }
        return stateSteps.indexOf(state);
    };

    const getStepStatus = (index: number) => {
        const currentIndex = getCurrentStep();

        if (state === 'CANCELLED') {
            if (index <= currentIndex) return 'error';
            return 'wait';
        }

        if (index < currentIndex) return 'finish';
        if (index === currentIndex) return 'process';
        return 'wait';
    };

    return (
        <Card title="Tiến tr trình đặt phòng" style={{ marginBottom: 24 }}>
            <Steps
                direction="vertical"
                size="small"
                current={getCurrentStep()}
                status={state === 'CANCELLED' ? 'error' : 'process'}
                items={[
                    {
                        title: 'Nhập thông tin',
                        description: `Form đã được gửi - ${new Date(createdAt).toLocaleString('vi-VN')}`,
                        status: getStepStatus(0)
                    },
                    {
                        title: 'Liên hệ khách sạn',
                        description: 'Agent đang gửi tin nhắn',
                        status: getStepStatus(1)
                    },
                    {
                        title: 'Đàm phán',
                        description: state === 'CANCELLED' ? 'Đã hủy' : 'Trao đổi với khách sạn',
                        status: getStepStatus(2)
                    },
                    {
                        title: 'Chờ xác nhận thanh toán',
                        description: 'Chờ user approve',
                        status: getStepStatus(3)
                    },
                    {
                        title: 'Hoàn thành',
                        description: completedAt
                            ? `Đã xong lúc ${new Date(completedAt).toLocaleString('vi-VN')}`
                            : 'Booking confirmed',
                        status: getStepStatus(4)
                    }
                ]}
            />
        </Card>
    );
};
