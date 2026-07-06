export enum BookingState {
    INPUT_READY = 'INPUT_READY',
    CONTACTING_HOTEL = 'CONTACTING_HOTEL',
    NEGOTIATING = 'NEGOTIATING',
    WAITING_USER_CONFIRM_PAYMENT = 'WAITING_USER_CONFIRM_PAYMENT',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED'
}

export interface PaymentRequest {
    amount: number;
    currency: string;
    description: string;
    paymentType: 'deposit' | 'full' | 'other';
}

export type AgentIntent =
    | 'NEGOTIATE'          // Trao đổi thông tin
    | 'REQUEST_PAYMENT'    // Sẵn sàng đặt, cần user confirm
    | 'CONFIRM_PAYMENT'    // User xác nhận thanh toán
    | 'PAYMENT_REQUIRED'   // Hotel yêu cầu thanh toán
    | 'FINISH'             // Hoàn tất
    | 'CANCEL';            // Hủy bỏ

export interface AgentAction {
    intent: AgentIntent;
    thought_process: string;
    stateSuggestion: BookingState;
    messageDraft: string | null;
    requiresUserConfirmation: boolean;
    paymentRequest: PaymentRequest | null;
}
