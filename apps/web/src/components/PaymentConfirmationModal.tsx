import React from 'react';
import { Modal, Button, Typography, Divider } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { PaymentInfo } from '../types/booking-api.types';

const { Title, Text } = Typography;

interface PaymentConfirmationModalProps {
    visible: boolean;
    paymentInfo: PaymentInfo;
    onConfirm: () => void;
    onReject: () => void;
    loading?: boolean;
}

export const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
    visible,
    paymentInfo,
    onConfirm,
    onReject,
    loading = false
}) => {
    const { amount, currency, paymentType, description } = paymentInfo;

    const paymentTypeLabel = paymentType === 'deposit' ? 'Đặt cọc' : 'Thanh toán toàn bộ';

    return (
        <Modal
            open={visible}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 24 }} />
                    <span style={{ fontSize: 18 }}>Xác nhận thanh toán</span>
                </div>
            }
            footer={null}
            closable={false}
            width={450}
            centered
        >
            <Divider style={{ margin: '16px 0' }} />

            <div style={{ padding: '16px 0' }}>
                {/* Payment Type */}
                <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>Loại thanh toán</Text>
                    <div style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: paymentType === 'deposit' ? '#1890ff' : '#52c41a',
                        marginTop: 4
                    }}>
                        {paymentTypeLabel}
                    </div>
                </div>

                {/* Amount */}
                <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>Số tiền</Text>
                    <div style={{
                        fontSize: 28,
                        fontWeight: 'bold',
                        color: '#000',
                        marginTop: 4
                    }}>
                        {amount.toLocaleString('vi-VN')} {currency}
                    </div>
                </div>

                {/* Description */}
                {description && (
                    <div style={{
                        marginBottom: 16,
                        padding: 12,
                        background: '#f5f5f5',
                        borderRadius: 8,
                        borderLeft: '3px solid #1890ff'
                    }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Mô tả</Text>
                        <div style={{ marginTop: 4, fontSize: 14 }}>
                            {description}
                        </div>
                    </div>
                )}

                {/* Warning */}
                <div style={{
                    marginTop: 20,
                    padding: 12,
                    background: '#fffbe6',
                    border: '1px solid #ffe58f',
                    borderRadius: 8
                }}>
                    <Text style={{ fontSize: 13, color: '#ad6800' }}>
                        ⚠️ Agent sẽ chỉ tiếp tục đàm phán/đặt phòng sau khi bạn xác nhận.
                        Từ chối sẽ dừng quá trình này.
                    </Text>
                </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
                <Button
                    danger
                    size="large"
                    block
                    icon={<CloseCircleOutlined />}
                    onClick={onReject}
                    disabled={loading}
                >
                    Từ chối
                </Button>
                <Button
                    type="primary"
                    size="large"
                    block
                    icon={<CheckCircleOutlined />}
                    onClick={onConfirm}
                    loading={loading}
                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                    Đồng ý thanh toán
                </Button>
            </div>
        </Modal>
    );
};
