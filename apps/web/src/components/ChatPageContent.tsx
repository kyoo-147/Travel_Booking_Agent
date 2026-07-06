import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Input, Button, Avatar, Card, App, Typography, Space, Row, Col, Tag, Tooltip, Dropdown, Menu, Modal, Collapse } from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  MessageOutlined,
  StarOutlined,
  GlobalOutlined,
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  HeartOutlined,
  FireOutlined,
  ThunderboltOutlined,
  PaperClipOutlined,
  DownOutlined,
  ToolOutlined,
  BankOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService, ChatRequest, ChatResponse } from '../services/chat.service';
import { webSearchService } from '../services/webSearch.service';
import { deepResearchService } from '../services/deep-research.service';
import { bookingApi } from '../services/booking-api.service';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ChatSidebar } from './ChatSidebar';
import { DeepResearchComponent } from './DeepResearchComponent';
import { BookingForm } from './BookingForm';
import { BookingRequest } from '../types/booking.types';
import { PaymentConfirmationModal } from './PaymentConfirmationModal';
import type { PaymentInfo } from '../types/booking-api.types';
import webSocketService from '../services/websocket.service';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const { TextArea } = Input;

// Helper to safely get domain
const getDomainFromUrl = (url: string) => {
  try {
    if (!url) return '';
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url || '';
  }
};

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  thinking?: string;
  sources?: { title: string; uri: string }[];
  type?: string; // For special message types (e.g., 'booking_payment_request')
  data?: any; // For payment info or other structured data
  paymentStatus?: 'pending' | 'approved' | 'rejected'; // Payment request status
}

// Quick action suggestions based on travel agent needs




export const ChatPageContent: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { message } = App.useApp();

  // Add transparent textarea styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .transparent-textarea .ant-input {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
      }
      .transparent-textarea .ant-input:focus {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
      }
      .transparent-textarea .ant-input:hover {
        background: transparent !important;
        border: none !important;
      }
      
      /* Custom scrollbar for messages */
      .messages-scroll-container {
        scrollbar-width: thin;
        scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
      }
      
      .messages-scroll-container::-webkit-scrollbar {
        width: 6px;
      }
      
      .messages-scroll-container::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .messages-scroll-container::-webkit-scrollbar-thumb {
        background-color: rgba(156, 163, 175, 0.5);
        border-radius: 3px;
        transition: background-color 0.2s ease;
      }
      
      .messages-scroll-container::-webkit-scrollbar-thumb:hover {
        background-color: rgba(156, 163, 175, 0.7);
      }
      
      /* Attach icon button hover effect */
      .attach-icon-button:hover {
        background-color: ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(243, 244, 246, 0.5)'} !important;
        color: ${isDark ? '#D1D5DB' : '#374151'} !important;
      }
      
      /* Tools dropdown button hover effect */
      .tools-dropdown-button:hover {
        background-color: ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(243, 244, 246, 0.5)'} !important;
        color: ${isDark ? '#D1D5DB' : '#374151'} !important;
      }
      
      /* Tools dropdown menu items styling */
      .ant-dropdown-menu {
        padding: 8px !important;
        border-radius: 12px !important;
        background: ${isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)'} !important;
        backdrop-filter: blur(20px) !important;
        border: 1px solid ${isDark ? 'rgba(71, 85, 105, 0.8)' : 'rgba(229, 231, 235, 0.8)'} !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06) !important;
      }
      
      .ant-dropdown-menu-item {
        padding: 12px 16px !important;
        border-radius: 8px !important;
        margin-bottom: 4px !important;
        font-size: 15px !important;
        line-height: 1.4 !important;
        color: ${isDark ? '#E5E7EB' : '#374151'} !important;
        transition: all 0.2s ease !important;
      }
      
      .ant-dropdown-menu-item:last-child {
        margin-bottom: 0 !important;
      }
      
      .ant-dropdown-menu-item:hover {
        background-color: ${isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)'} !important;
        color: ${isDark ? '#60A5FA' : '#2563EB'} !important;
      }
      
      .ant-dropdown-menu-item .anticon {
        font-size: 16px !important;
        margin-right: 12px !important;
      }
      
      /* Info icon styling in dropdown items */
      .ant-dropdown-menu-item .ant-tooltip {
        opacity: 0 !important;
        transition: opacity 0.2s ease !important;
      }
      
      .ant-dropdown-menu-item:hover .ant-tooltip {
        opacity: 1 !important;
      }
      
      /* Ensure dropdown item content has proper spacing */
      .ant-dropdown-menu-item > div {
        width: 100% !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
      }
      
      /* Tool close button hover effect */
      .tool-close-button:hover {
        background-color: rgba(37, 99, 235, 0.15) !important;
        color: #1D4ED8 !important;
      }
      
      /* Simple tool close button hover effect */
      .tool-close-button-simple:hover {
        background-color: rgba(107, 114, 128, 0.1) !important;
        color: #374151 !important;
      }
      
      /* Selected tool display hover effect */
      .selected-tool-display:hover {
        color: #1D4ED8 !important;
      }
      
      .selected-tool-display:hover .tool-icon {
        opacity: 0 !important;
      }
      
      .selected-tool-display:hover::before {
        content: '✕' !important;
        position: absolute !important;
        font-size: 12px !important;
        color: #1D4ED8 !important;
        font-weight: bold !important;
        z-index: 1 !important;
      }
      
      .selected-tool-display {
        position: relative !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMainLayoutSiderCollapsed, setIsMainLayoutSiderCollapsed] = useState(false); // Track MainLayout Sider
  const [isLayoutReady, setIsLayoutReady] = useState(false); // Track khi layout đã detect xong
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showCompactButtons, setShowCompactButtons] = useState(false);
  const [isInputMounted, setIsInputMounted] = useState(false); // For animation
  const [showRainbowEffect, setShowRainbowEffect] = useState(true); // Control rainbow effect
  const [selectedTool, setSelectedTool] = useState<{ key: string, label: string, icon: React.ReactNode } | null>(null); // Track selected tool
  const [showSourcesSidebar, setShowSourcesSidebar] = useState(false);
  const [isDeepResearchActive, setIsDeepResearchActive] = useState(false);
  const [deepResearchQuery, setDeepResearchQuery] = useState('');
  const [sidebarSources, setSidebarSources] = useState<{ title: string; uri: string }[]>([]);
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isBookingFormVisible, setIsBookingFormVisible] = useState(false);

  // Payment Confirmation Modal State
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [currentPaymentInfo, setCurrentPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paymentConfirmLoading, setPaymentConfirmLoading] = useState(false);




  // Handle New Chat triggered from Navigation State (e.g. "+" button in sidebar)
  useEffect(() => {
    // Check if newChat flag is present in location state
    if (location.state && (location.state as any).newChat) {
      // Reset ALL states to initial values
      setMessages([]);
      setInputValue('');
      setLoading(false);
      setShowWelcome(true);
      setSelectedTool(null);
      setIsBookingFormVisible(false);
      setIsDeepResearchActive(false);
      setDeepResearchQuery('');
      setSidebarSources([]);

      // Clear the state to prevent double-reset on re-renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Load session history
  useEffect(() => {
    const loadSession = async () => {
      // ✅ Prevent reloading message history while sending/streaming to avoid overwriting current state
      if (loading && messages.length > 0) return;

      if (sessionId && user?.id) {
        try {
          // Don't set global loading here if we are just background refreshing, 
          // but for initial load it's fine.
          // Check if we are already "loading" due to send action
          if (!loading) setLoading(true);
          const session = await chatService.getSession(sessionId, user.id);

          // ✅ 1. Create a map of payment statuses with Heuristic Fallback
          const paymentStatusMap = new Map<string, 'approved' | 'rejected'>();
          let lastPaymentRequestId: string | null = null;

          // Sort messages by timestamp to ensure chronological order for heuristic logic
          const sortedMessages = [...session.messages].sort((a: any, b: any) =>
            (new Date(a.timestamp || 0).getTime()) - (new Date(b.timestamp || 0).getTime())
          );

          sortedMessages.forEach((msg: any) => {
            // Robust Payment Request Detection
            // Check metadata type OR existence of payment info OR content keywords
            const isPaymentRequest =
              msg.type === 'booking_payment_request' ||
              msg.metadata?.type === 'booking_payment_request' ||
              (typeof msg.metadata?.paymentInfo === 'object' && msg.metadata?.paymentInfo !== null);

            if (isPaymentRequest) {
              lastPaymentRequestId = msg.id;
            }

            // Check for explicit metadata linkage
            if (msg.metadata?.action === 'payment_approved' && msg.metadata?.messageId) {
              paymentStatusMap.set(msg.metadata.messageId, 'approved');
            } else if (msg.metadata?.action === 'payment_rejected' && msg.metadata?.messageId) {
              paymentStatusMap.set(msg.metadata.messageId, 'rejected');
            }

            // ✅ HEURISTIC FALLBACK: Always check content too!
            // This fixes the issue where local ID (stale) was saved in metadata but DB ID is different.
            const contentLower = msg.content?.toLowerCase() || '';

            if (contentLower.includes('đã phê duyệt') || contentLower.includes('đã xác nhận thanh toán') || contentLower.includes('đã thanh toán')) {
              if (lastPaymentRequestId) {
                paymentStatusMap.set(lastPaymentRequestId, 'approved');
              }
            }
            else if (contentLower.includes('đã từ chối') || contentLower.includes('hủy')) {
              if (lastPaymentRequestId) {
                paymentStatusMap.set(lastPaymentRequestId, 'rejected');
              }
            }
          });

          const formattedMessages: Message[] = session.messages.map((msg: any) => {
            // ✅ Auto-correct sender: if metadata.sender === 'agent', display on RIGHT (user position)
            let displaySender: 'user' | 'assistant' = msg.role as 'user' | 'assistant';
            if (msg.metadata?.sender === 'agent') {
              displaySender = 'user'; // Agent represents user, display on RIGHT
            } else if (msg.metadata?.sender === 'hotel') {
              displaySender = 'assistant'; // Hotel displays on LEFT
            } else if (
              msg.content?.includes?.('(Agent đang nhắn tin') ||
              msg.content?.includes?.('Mình đồng ý đặt phòng') ||
              msg.content?.includes?.('Đã phê duyệt') ||
              msg.content?.includes?.('Đã từ chối') ||
              msg.content?.includes?.('✅ XÁC NHẬN')
            ) {
              displaySender = 'user'; // Agent/User actions on RIGHT
              // console.log('✅ Content-based detection:', msg.content.substring(0, 50));
            } else if (msg.type === 'booking_payment_request' || msg.metadata?.type === 'booking_payment_request') {
              displaySender = 'user'; // Payment request on RIGHT (User/Agent side)
            }

            // check if there is an override status for this message
            const overrideStatus = paymentStatusMap.get(msg.id) || msg.metadata?.paymentStatus || 'pending';

            // 🔍 DEBUG: Log payment request messages to diagnose missing payment card
            if (msg.type === 'booking_payment_request' || msg.metadata?.type === 'booking_payment_request') {
              console.log('💳 [DEBUG loadSession] Payment Request Message:', {
                id: msg.id,
                content: msg.content?.substring(0, 50),
                'msg.type': msg.type,
                'msg.metadata?.type': msg.metadata?.type,
                'msg.metadata?.paymentInfo': msg.metadata?.paymentInfo,
                'msg.metadata?.data': msg.metadata?.data,
                'Will set type to': msg.metadata?.type,
                'Will set data to': msg.metadata?.paymentInfo || msg.metadata?.data
              });
            }

            return {
              id: msg.id,
              content: msg.content,
              sender: displaySender, // Use corrected sender
              timestamp: new Date(msg.timestamp),
              sources: msg.metadata?.sources,
              thinking: msg.metadata?.thinking, // ✅ Load thinking from DB
              type: msg.metadata?.type, // Payment request type
              data: msg.metadata?.paymentInfo || msg.metadata?.data, // Payment data
              paymentStatus: overrideStatus // Payment status with override
            };
          });
          setMessages(formattedMessages);
          setShowWelcome(false);
          setShowRainbowEffect(false);
        } catch (error) {
          console.error('Failed to load session:', error);
          message.error('Không thể tải lịch sử chat');
          navigate('/chat');
        } finally {
          setLoading(false);
        }
      } else if (!sessionId) {
        setMessages([]);
        setShowWelcome(true);
        setShowRainbowEffect(true);
      }
    };

    loadSession();
  }, [sessionId, user?.id]);

  // Available tools for dropdown
  const availableTools = [
    {
      value: 'general',
      label: 'Chất Tổng Quát',
      icon: '🧠',
      key: 'general'
    },
    {
      value: 'web-search',
      label: 'Tìm Kiếm Web',
      icon: '🔍',
      key: 'web-search'
    },
    {
      value: 'deep-research',
      label: 'Nghiên Cứu Sâu',
      icon: '🔬',
      key: 'deep-research'
    },
    {
      value: 'booking-agents',
      label: 'Đại Lý Đặt Phòng',
      icon: '🏨',
      key: 'booking-agents'
    }
  ];

  // Handle tool selection
  const handleToolSelect = (tool: any) => {
    setSelectedTool(tool);
  };

  // Handle send message 
  const handleSend = () => {
    if (inputValue.trim()) {
      handleSendMessage(inputValue.trim());
    }
  };

  // Detect MainLayout Sider collapse state
  useEffect(() => {
    const detectMainLayoutSider = () => {
      // Tìm MainLayout Sider element
      const sider = document.querySelector('.ant-layout-sider');
      if (sider) {
        const isCollapsed = sider.classList.contains('ant-layout-sider-collapsed');
        setIsMainLayoutSiderCollapsed(isCollapsed);

        // Set layout ready chỉ sau khi đã có state chính xác
        if (!isLayoutReady) {
          setIsLayoutReady(true);
        }

        console.log('🔍 MainLayout Sider state:', isCollapsed ? 'collapsed' : 'expanded');
      }
    };

    // Initial check với delay để đảm bảo DOM ready
    const initialCheck = setTimeout(() => {
      detectMainLayoutSider();
      // Nếu không tìm thấy sider sau 200ms, coi như ready với default state
      if (!isLayoutReady) {
        setIsLayoutReady(true);
      }
    }, 100);

    // MutationObserver để theo dõi thay đổi class của Sider
    const observer = new MutationObserver(detectMainLayoutSider);
    const sider = document.querySelector('.ant-layout-sider');

    if (sider) {
      observer.observe(sider, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    return () => {
      clearTimeout(initialCheck);
      observer.disconnect();
    };
  }, [isLayoutReady]);

  // Animation trigger chỉ khi layout đã ready
  useEffect(() => {
    if (isLayoutReady) {
      // Delay thêm một chút để đảm bảo CSS class đã được apply
      setTimeout(() => setIsInputMounted(true), 150);
    }
  }, [isLayoutReady]);

  // Tính toán left position dựa trên MainLayout Sider state
  const getLeftPosition = () => {
    // Mobile: luôn căn giữa
    if (windowWidth <= 768) {
      return '50%';
    }

    // Desktop: tính toán dựa trên Sider state
    if (isMainLayoutSiderCollapsed) {
      // Sider collapsed (80px) + Content margin (24px) = 104px offset
      // Center của available area = 104px + (100vw - 104px)/2 = 52px + 50vw
      return 'calc(52px + 50vw)';
    } else {
      // Sider expanded (256px) + Content margin (24px) = 280px offset  
      // Center của available area = 280px + (100vw - 280px)/2 = 140px + 50vw
      return 'calc(140px + 50vw)';
    }
  };

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setShowCompactButtons(width < 600);

      // Auto-close ChatSidebar on small screens
      if (width < 900 && isSidebarOpen) {
        console.log('🔴 Auto-closing ChatSidebar due to small screen:', width);
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  // Click outside handler for sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Close ChatSidebar trên mobile/tablet khi click outside
      if (windowWidth < 900 && isSidebarOpen && !target.closest('.chat-sidebar') && !target.closest('.sidebar-toggle')) {
        console.log('Closing sidebar due to click outside');
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, windowWidth]);

  // Watchdog effect - continuously check for collision
  useEffect(() => {
    const checkCollision = () => {
      const width = window.innerWidth;
      if (width < 900 && isSidebarOpen) {
        console.log('🚨 Watchdog: Force closing sidebar due to collision - Width:', width);
        setIsSidebarOpen(false);
      }
    };

    // Immediate check
    checkCollision();

    const interval = setInterval(checkCollision, 100); // Check every 100ms for responsiveness
    return () => clearInterval(interval);
  }, [isSidebarOpen]);

  // Additional immediate check effect
  useEffect(() => {
    const width = window.innerWidth;
    if (width < 900 && isSidebarOpen) {
      console.log('⚡ Immediate force close - Width:', width);
      setIsSidebarOpen(false);
    }
  }, [isSidebarOpen, windowWidth]);

  // Force close sidebar on initial mount if screen is small
  useEffect(() => {
    // Manual trigger for initial check
    const initialWidth = window.innerWidth;
    console.log('Initial check - width:', initialWidth, 'sidebar:', isSidebarOpen);

    if (initialWidth < 900 && isSidebarOpen) {
      console.log('Initial force close sidebar for small screen');
      setIsSidebarOpen(false);
    }

    // Also trigger a manual resize event to ensure all logic runs
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, []); // Only run on mount

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to format message content with styled links and basic markdown
  const formatMessageContent = (content: string) => {
    // First, handle all link patterns across the entire content (including multiline)
    let processedContent = content;

    // Handle markdown links [text](url)
    processedContent = processedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
      try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname.replace('www.', '');
        return ` [[LINK_BUTTON::${domain}::${url}]] `;
      } catch {
        return match;
      }
    });

    // Handle EVERY possible parentheses pattern with domains - be more aggressive
    // Pattern 1: Simple (domain.com) on same line
    processedContent = processedContent.replace(/\(\s*([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\s*\)/g, (match, domain) => {
      const cleanDomain = domain.trim();
      return ` [[SIMPLE_BUTTON::${cleanDomain}::https://${cleanDomain}]] `;
    });

    // Pattern 2: Multiline with any whitespace/newlines
    processedContent = processedContent.replace(/\(\s*\n+\s*([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\s*\n+\s*↗?\s*\n*\s*\)/gs, (match, domain) => {
      const cleanDomain = domain.trim();
      return ` [[SIMPLE_BUTTON::${cleanDomain}::https://${cleanDomain}]] `;
    });

    // Pattern 3: Any opening paren followed by domain on new line(s)
    processedContent = processedContent.replace(/\(\s*[\r\n]+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})[\s\r\n]*↗?[\s\r\n]*\)/gs, (match, domain) => {
      const cleanDomain = domain.trim();
      return ` [[SIMPLE_BUTTON::${cleanDomain}::https://${cleanDomain}]] `;
    });

    // Pattern 4: Ultra aggressive - find any standalone domains in parentheses
    processedContent = processedContent.replace(/\([^)]*?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})[^)]*?\)/gs, (match, domain) => {
      // Only replace if it looks like a clean domain (no other significant text)
      const cleanMatch = match.replace(/[\s\n\r↗()]/g, '');
      if (cleanMatch === domain.trim()) {
        return ` [[SIMPLE_BUTTON::${domain.trim()}::https://${domain.trim()}]] `;
      }
      return match;
    });

    // Split content into lines AFTER processing links
    const lines = processedContent.split('\n');
    const elements = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Handle different markdown elements
      if (line.startsWith('**') && line.endsWith('**')) {
        // Bold headers
        const text = line.slice(2, -2);
        elements.push(
          <h3 key={i} style={{ fontSize: '16px', fontWeight: '600', margin: '12px 0 6px 0', color: 'inherit' }}>
            {formatLineWithLinks(text)}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        // List items
        const text = line.slice(2);
        elements.push(
          <div key={i} style={{ margin: '4px 0', color: 'inherit', display: 'flex', alignItems: 'flex-start' }}>
            <span style={{ marginRight: '8px' }}>•</span>
            <span style={{ wordWrap: 'break-word', flex: 1 }}>{formatLineWithLinks(text)}</span>
          </div>
        );
      } else if (line.trim() === '') {
        // Empty line
        elements.push(<br key={i} />);
      } else {
        // Regular paragraph
        elements.push(
          <p key={i} style={{ margin: '0 0 8px 0', color: 'inherit', wordWrap: 'break-word' }}>
            {formatLineWithLinks(line)}
          </p>
        );
      }
    }

    return elements;
  };

  // Helper function to format links in a single line (simplified since links are pre-processed)
  const formatLineWithLinks = (text: string) => {
    // Split by button markers only (links already processed at content level)
    const parts = text.split(/(\[\[(?:LINK|SIMPLE)_BUTTON::[^\]]+\]\])/);
    const result = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();

      if (part.startsWith('[[LINK_BUTTON::')) {
        // Markdown link button
        const match = part.match(/\[\[LINK_BUTTON::([^:]+)::([^\]]+)\]\]/);
        if (match) {
          const [, domain, url] = match;
          const cleanDomain = domain.replace(/[()↗\s]/g, '');
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=16`;

          result.push(
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)',
                border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)'}`,
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '500',
                color: isDark ? '#4ADE80' : '#16A34A',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                margin: '0 4px',
                verticalAlign: 'middle'
              }}
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.12)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
            >
              <img
                src={faviconUrl}
                alt=""
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '3px',
                  flexShrink: 0
                }}
                onError={(e) => {
                  e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="16" height="16" rx="3" fill="${isDark ? '#374151' : '#E5E7EB'}"/>
                      <text x="8" y="11" text-anchor="middle" fill="${isDark ? '#D1D5DB' : '#6B7280'}" font-size="8" font-family="Arial">🌐</text>
                    </svg>
                  `)}`;
                }}
              />
              <span>{cleanDomain}</span>
              <span style={{ fontSize: '11px', opacity: 0.7 }}>↗</span>
            </span>
          );
        }
      } else if (part.startsWith('[[SIMPLE_BUTTON::')) {
        // Simple domain button
        const match = part.match(/\[\[SIMPLE_BUTTON::([^:]+)::([^\]]+)\]\]/);
        if (match) {
          const [, domain, url] = match;
          const cleanDomain = domain.replace(/[()↗\s]/g, '');
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=14`;

          result.push(
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`,
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: '500',
                color: isDark ? '#60A5FA' : '#2563EB',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                margin: '0 2px',
                verticalAlign: 'middle'
              }}
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img
                src={faviconUrl}
                alt=""
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '2px',
                  flexShrink: 0
                }}
                onError={(e) => {
                  e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="14" height="14" rx="2" fill="${isDark ? '#374151' : '#E5E7EB'}"/>
                      <text x="7" y="9.5" text-anchor="middle" fill="${isDark ? '#D1D5DB' : '#6B7280'}" font-size="7" font-family="Arial">W</text>
                    </svg>
                  `)}`;
                }}
              />
              {cleanDomain}
            </span>
          );
        }
      } else if (part) {
        // Regular text - handle basic markdown
        let textPart = part;

        // Handle bold text (**text**)
        textPart = textPart.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        if (textPart.includes('<strong>')) {
          result.push(<span key={i} dangerouslySetInnerHTML={{ __html: textPart }} />);
        } else {
          result.push(textPart);
        }
      }
    }

    return result;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]); // ← Add loading to trigger scroll when loading indicator appears

  // Reset rainbow effect khi quay lại welcome screen
  useEffect(() => {
    if (showWelcome && messages.length === 0 && inputValue.length === 0) {
      setShowRainbowEffect(true);
    }
  }, [showWelcome, messages.length, inputValue.length]);

  // ✅ Listen for WebSocket notifications (hotel messages, agent responses, payment requests)
  useEffect(() => {
    if (!user?.id) return;

    const cleanup = webSocketService.onBookingPaymentRequest((notification) => {
      console.log('📡 [ChatPage] Received notification:', notification);

      // Handle different notification types
      // ⚠️ IMPORTANT: Check sender='agent' FIRST before checking type
      if (notification.sender === 'agent' && notification.type !== 'booking_payment_request') {
        // Agent normal message - display on RIGHT (user position, agent represents user)
        console.log('🤖 [Agent] Non-payment agent message');
        const agentMessage: Message = {
          id: notification.id || Date.now().toString(),
          content: notification.content || 'Đang xử lý...',
          sender: 'user', // Agent on RIGHT side (represents user)
          timestamp: new Date()
        };
        setMessages(prev => [...prev, agentMessage]);

        if (sessionId) {
          chatService.addMessage(sessionId, 'user', agentMessage.content, {
            sender: 'agent'
          }).catch(err => console.error('Failed to save agent message:', err));
        }
      }
      else if (notification.type === 'hotel_message') {
        // Hotel message - display on LEFT (assistant/hotel position)
        const hotelMessage: Message = {
          id: notification.id || Date.now().toString(),
          content: notification.content,
          sender: 'assistant', // Hotel on left side
          timestamp: new Date(notification.timestamp || Date.now())
        };
        setMessages(prev => [...prev, hotelMessage]);

        if (sessionId) {
          chatService.addMessage(sessionId, 'assistant', hotelMessage.content, {
            sender: 'hotel'
          }).catch(err => console.error('Failed to save hotel message:', err));
        }
      }
      else if (notification.type === 'booking_payment_request' || notification.requiresUserApproval) {
        // Payment request - display on LEFT with buttons
        console.log('💳 [Payment] Full notification:', JSON.stringify(notification, null, 2));

        // Extract payment amount from various possible locations
        const paymentInfo = notification.paymentInfo || notification.data?.paymentInfo || {};
        const amount = paymentInfo.amount || notification.data?.amount;

        console.log('💳 [Payment] paymentInfo:', paymentInfo);
        console.log('💳 [Payment] extracted amount:', amount);

        const paymentMessage: Message = {
          id: notification.id || Date.now().toString(),
          content: notification.content || 'Yêu cầu xác nhận thanh toán',
          sender: 'user', // Payment request aligned RIGHT
          timestamp: new Date(),
          type: 'booking_payment_request',
          data: { ...paymentInfo, amount } // Ensure amount is at root level
        };
        setMessages(prev => [...prev, paymentMessage]);

        if (sessionId) {
          chatService.addMessage(sessionId, 'user', paymentMessage.content, {
            type: 'booking_payment_request',
            paymentInfo: paymentMessage.data
          }).catch(err => console.error('Failed to save payment message:', err));
        }
      }
    });

    return cleanup;
  }, [user?.id, sessionId]);

  // Handle Booking Form Submission
  const handleBookingSubmit = async (data: BookingRequest) => {
    // ✅ Immediately hide form and show loading - NO intermediate message
    setShowWelcome(false);
    setIsBookingFormVisible(false);
    setSelectedTool(null);
    setLoading(true);

    // ✅ SHORT trigger message only (NOT detailed prompt)
    const triggerMessage = "Bắt đầu tìm phòng";

    // Create Session if needed
    let currentSessionId = sessionId;
    if (!currentSessionId && user?.id) {
      try {
        const newSession = await chatService.createSession(user.id, `Đặt phòng: ${data.tripDetails.destination}`);
        currentSessionId = newSession.id;
        navigate(`/chat/${currentSessionId}`, { replace: true });
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    }

    try {
      // ✅ NEW: Call /api/booking/context to ingest structured data using bookingApi
      const contextResult = await bookingApi.ingestContext({
        userId: user?.id || '',
        sessionId: currentSessionId,
        context: {
          userContact: {
            ...data.userContact,
            preferredLanguage: data.userContact.preferredLanguage || 'vi',
            communicationStyle: data.userContact.communicationStyle || 'casual'
          },
          hotelContact: data.hotelContact, // ✅ ADDED: Pass hotel contact for Zalo messaging
          tripDetails: data.tripDetails
        }
      });

      console.log('[Frontend] Context ingested:', contextResult);

      // ✅ NEW: Query agent with SHORT message using bookingApi
      const queryResult = await bookingApi.queryAgent({
        sessionId: contextResult.sessionId || currentSessionId || '',
        userId: user?.id || '',
        message: triggerMessage, // ← SHORT message
        history: messages.map(m => ({
          role: m.sender,
          content: m.content,
          timestamp: m.timestamp.toISOString()
        }))
      });

      console.log('[Frontend] Agent response:', queryResult);

      // ✅ FIXED: Parse correct BE response structure with safe typing
      const agentResponse = queryResult.data as any; // BE returns dynamic structure

      // Check if this is a payment request
      if (agentResponse?.type === 'booking_payment_request' && agentResponse?.requiresUserApproval) {
        console.log('[Frontend] 💰 Payment request detected');

        // Add message to chat
        setMessages(prev => [...prev, {
          id: agentResponse.id || Date.now().toString(),
          sender: 'assistant',
          content: agentResponse.content || 'Agent đang chờ xác nhận thanh toán',
          timestamp: new Date()
        }]);

        // Save to database
        if (currentSessionId) {
          await chatService.addMessage(currentSessionId, 'assistant', agentResponse.content, {
            type: 'booking_payment_request',
            paymentInfo: agentResponse.paymentInfo,
            data: agentResponse.data,
            requiresUserApproval: true
          });
        }

        // Show payment confirmation modal
        Modal.confirm({
          title: '💰 Xác nhận đặt phòng',
          width: 500,
          icon: null,
          content: (
            <div>
              <p><strong>Agent đã tìm được phòng phù hợp!</strong></p>
              <p style={{ marginTop: 12 }}>{agentResponse.content}</p>
              {agentResponse.paymentInfo && (
                <div style={{
                  marginTop: 16,
                  padding: 12,
                  background: isDark ? '#1f2937' : '#f3f4f6',
                  borderRadius: 8
                }}>
                  <p><strong>Thông tin thanh toán:</strong></p>
                  {agentResponse.paymentInfo.amount && (
                    <p>• Số tiền: <strong>{agentResponse.paymentInfo.amount.toLocaleString('vi-VN')} VNĐ</strong></p>
                  )}
                  {agentResponse.paymentInfo.method && (
                    <p>• Phương thức: {agentResponse.paymentInfo.method}</p>
                  )}
                  {agentResponse.data?.paymentInfo?.summary && (
                    <p style={{ marginTop: 8, fontStyle: 'italic' }}>
                      {agentResponse.data.paymentInfo.summary}
                    </p>
                  )}
                </div>
              )}
            </div>
          ),
          okText: '✅ Xác nhận đặt phòng',
          cancelText: '❌ Hủy',
          onOk: async () => {
            message.success('Đã xác nhận! Agent sẽ tiếp tục liên hệ với khách sạn.');
            // TODO: Send confirmation back to agent
          },
          onCancel: () => {
            message.info('Đã hủy yêu cầu đặt phòng');
          },
        });

        setLoading(false);
        return; // Exit early, don't process as normal message
      }

      // ✅ Handle OLD format for backward compatibility
      const { message: agentMessage, requiresUserApproval, paymentInfo } = queryResult.data as any;

      if (requiresUserApproval && paymentInfo) {
        // Show payment confirmation modal
        setCurrentPaymentInfo(paymentInfo);
        setIsPaymentModalVisible(true);

        // Add system message
        const systemMessage: Message = {
          id: Date.now().toString(),
          content: '⚠️ **Agent đang chờ xác nhận thanh toán từ bạn.**',
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, systemMessage]);

        // ✅ Save system message to database
        if (currentSessionId) {
          await chatService.addMessage(currentSessionId, 'assistant', systemMessage.content);
        }
      } else if (agentMessage) {
        // Display agent message
        const isAgentAction = typeof agentMessage === 'string' && agentMessage.includes('(Agent đang nhắn tin');

        const botMessage: Message = {
          id: Date.now().toString(),
          content: agentMessage,
          sender: isAgentAction ? 'user' : 'assistant', // Agent action aligns RIGHT
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);

        // ✅ Save agent message to database
        if (currentSessionId) {
          await chatService.addMessage(currentSessionId, 'assistant', agentMessage, {
            sender: isAgentAction ? 'agent' : 'assistant'
          });
        }
      }

    } catch (error) {
      console.error('Booking Error:', error);
      message.error('Lỗi khi gửi yêu cầu đặt phòng');
    } finally {
      setLoading(false);
      setSelectedTool(null);
    }
  };


  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || loading) return;

    // Hide welcome screen when sending first message
    setShowWelcome(false);

    // Tắt rainbow effect khi user bắt đầu chat
    setShowRainbowEffect(false);

    // If no session ID, create one
    let currentSessionId = sessionId;
    if (!currentSessionId && user?.id) {
      try {
        const newSession = await chatService.createSession(user.id, textToSend.substring(0, 50));
        currentSessionId = newSession.id;
        // Update URL without reloading page
        navigate(`/chat/${currentSessionId}`, { replace: true });
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    // ✅ FORCE SAVE User Message to DB immediately
    // This prevents message loss during navigation/refresh
    if (currentSessionId && user?.id) {
      try {
        await chatService.addMessage(currentSessionId, 'user', textToSend);
      } catch (err) {
        console.error('Failed to save user message to DB:', err);
      }
    }

    try {
      let assistantMessage: Message;

      // Check if a tool is selected
      if (selectedTool?.key === 'web-search') {
        // Use Web Search API with Streaming (AsyncGenerator)

        // Create placeholder message
        const assistantMsgId = Date.now().toString();
        assistantMessage = {
          id: assistantMsgId,
          content: '',
          sender: 'assistant',
          timestamp: new Date(),
          sources: []
        };
        setMessages(prev => [...prev, assistantMessage]);

        let fullContent = '';
        let displayedContent = '';
        let finalSources: { title: string; uri: string }[] = [];
        let pendingChars: string[] = [];
        let isAnimating = false;

        // Typewriter animation - smooth character by character display
        const animateTypewriter = () => {
          if (pendingChars.length === 0) {
            isAnimating = false;
            return;
          }
          isAnimating = true;

          // Display 2-4 chars per frame for natural speed
          const charsPerFrame = Math.min(3, pendingChars.length);
          for (let i = 0; i < charsPerFrame; i++) {
            displayedContent += pendingChars.shift();
          }

          setMessages(prev => prev.map(msg =>
            msg.id === assistantMsgId
              ? { ...msg, content: displayedContent }
              : msg
          ));

          requestAnimationFrame(() => {
            setTimeout(animateTypewriter, 12); // ~80 chars/sec
          });
        };

        // Use parsed stream generator with user context for memory
        try {
          for await (const event of webSearchService.searchWithStreamParsed(textToSend, user?.id, currentSessionId)) {
            if (event.type === 'content' && event.content) {
              fullContent += event.content;
              pendingChars.push(...event.content.split(''));
              if (!isAnimating) animateTypewriter();
            } else if (event.type === 'sources' && event.sources) {
              finalSources = event.sources;
              setMessages(prev => prev.map(msg =>
                msg.id === assistantMsgId
                  ? { ...msg, sources: finalSources }
                  : msg
              ));
            } else if (event.type === 'error') {
              console.error('Web search stream error:', event.error);
              message.error('Lỗi tìm kiếm: ' + event.error);
            }
          }
          // Wait for animation to finish
          while (pendingChars.length > 0) {
            await new Promise(r => setTimeout(r, 50));
          }
        } catch (streamError) {
          console.error('Stream iteration error:', streamError);
          message.error('Có lỗi khi xử lý kết quả tìm kiếm');
        }

        // ✅ Save Assistant Message (Web Search) to DB
        assistantMessage = { ...assistantMessage, content: fullContent, sources: finalSources };
        if (currentSessionId) {
          await chatService.addMessage(currentSessionId, 'assistant', fullContent, {
            sender: 'assistant',
            type: 'web_search_result',
            sources: finalSources
          });
        }

      } else if (selectedTool?.key === 'deep-research') {
        // Use Deep Research API with streaming
        setIsDeepResearchActive(true);
        setDeepResearchQuery(textToSend);

        // We'll handle the response in the DeepResearchComponent
        // Don't create assistant message here yet
        setLoading(false);
        return;

      } else {
        // Use regular chat service
        const request: ChatRequest = {
          message: textToSend,
          language: 'vi',
          context: {
            userId: user?.id,
            sessionId: currentSessionId,
            conversationHistory: messages.map(msg => ({
              content: msg.content,
              sender: msg.sender as 'user' | 'assistant',
              id: msg.id,
              timestamp: msg.timestamp,
              type: 'text',
              role: msg.sender as 'user' | 'assistant'
            }))
          }
        };

        const response: ChatResponse = await chatService.sendMessage(request);

        assistantMessage = {
          id: response.id,
          content: response.content,
          sender: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      message.error('Không thể gửi tin nhắn. Vui lòng thử lại.');

      const errorMessage: Message = {
        id: 'error-' + Date.now(),
        content: 'Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      if (selectedTool?.key !== 'deep-research') {
        setLoading(false);
      }
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handler để tắt rainbow effect khi user bắt đầu nhập text
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Tắt rainbow effect ngay khi user bắt đầu nhập text
    if (value.length > 0 && showRainbowEffect) {
      setShowRainbowEffect(false);
    }
  };

  // Tools handlers
  const handleWebSearch = () => {
    setSelectedTool({
      key: 'web-search',
      label: 'Tìm Kiếm Web',
      icon: <GlobalOutlined />
    });
    setInputValue('');
    message.success('Công cụ Tìm Kiếm Web đã được kích hoạt!');
  };

  const handleDeepResearch = () => {
    setSelectedTool({
      key: 'deep-research',
      label: 'Nghiên Cứu Sâu',
      icon: <SearchOutlined />
    });
    setInputValue('');
    message.success('Công cụ Nghiên Cứu Sâu đã được kích hoạt!');
  };

  const handleBookingAgents = () => {
    setSelectedTool({
      key: 'booking-agents',
      label: 'Đại Lý Đặt Phòng',
      icon: <BankOutlined />
    });
    setInputValue('');
    message.success('Công cụ Đại Lý Đặt Phòng đã được kích hoạt!');
    setIsBookingFormVisible(true);

  };

  const handleClearTool = () => {
    setSelectedTool(null);
    setInputValue('');
    setIsBookingFormVisible(false);
  };




  const handleDeepResearchResult = (result: { content: string; sources: { title: string; uri: string }[]; thinking?: string }) => {
    const assistantMessage: Message = {
      id: Date.now().toString(),
      content: result.content,
      sender: 'assistant',
      timestamp: new Date(),
      sources: result.sources,
      thinking: result.thinking
    };

    setMessages(prev => [...prev, assistantMessage]);

    // ✅ Save Deep Research Result to DB
    if (sessionId) {
      chatService.addMessage(sessionId, 'assistant', result.content, {
        sender: 'assistant',
        type: 'deep_research_result',
        sources: result.sources,
        thinking: result.thinking
      }).catch(err => console.error('Failed to save deep research result:', err));
    }

    setIsDeepResearchActive(false);
    setDeepResearchQuery('');
    setLoading(false);
  };

  const handleDeepResearchError = (error: string) => {
    const errorMessage: Message = {
      id: Date.now().toString(),
      content: `Lỗi trong quá trình nghiên cứu: ${error}`,
      sender: 'assistant',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, errorMessage]);
    setIsDeepResearchActive(false);
    setDeepResearchQuery('');
    setLoading(false);
  };

  // Payment Confirmation Handlers
  const handlePaymentConfirm = async () => {
    if (!currentPaymentInfo || !sessionId) return;

    setPaymentConfirmLoading(true);
    try {
      // ✅ Use bookingApi service
      await bookingApi.confirmPayment({
        sessionId,
        approved: true
      });

      // Close modal
      setIsPaymentModalVisible(false);
      setCurrentPaymentInfo(null);

      // Add confirmation message
      const confirmMessage: Message = {
        id: Date.now().toString(),
        content: `✅ **Đã xác nhận thanh toán ${currentPaymentInfo.amount.toLocaleString('vi-VN')} ${currentPaymentInfo.currency}**\n\nAgent sẽ tiếp tục xử lý đặt phòng.`,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmMessage]);
      message.success('Đã xác nhận thanh toán!');

      // Trigger next agent action
      // TODO: Call agent query again to continue

    } catch (error) {
      console.error('Payment confirm error:', error);
      message.error('Lỗi khi xác nhận thanh toán');
    } finally {
      setPaymentConfirmLoading(false);
    }
  };

  const handlePaymentReject = async () => {
    if (!sessionId) return;

    setPaymentConfirmLoading(true);
    try {
      // ✅ Use bookingApi service
      await bookingApi.confirmPayment({
        sessionId,
        approved: false
      });

      // Close modal
      setIsPaymentModalVisible(false);
      setCurrentPaymentInfo(null);

      // Add rejection message
      const rejectMessage: Message = {
        id: Date.now().toString(),
        content: '❌ **Đã từ chối thanh toán**\n\nQuá trình đặt phòng đã dừng lại.',
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, rejectMessage]);
      message.info('Đã từ chối thanh toán');

    } catch (error) {
      console.error('Payment reject error:', error);
      message.error('Lỗi khi từ chối thanh toán');
    } finally {
      setPaymentConfirmLoading(false);
    }
  };


  return (
    <>


      {/* CSS với Rainbow Animation cho input */}
      <style>
        {`
          /* CSS Properties cho rainbow animation */
          @property --bg-position {
            syntax: "<number>";
            inherits: true;
            initial-value: 100;
          }

          /* Rainbow colors */
          :root {
            --color-white: #ffffff;
            --color-cyan: #00ffff;
            --color-blue: #0066ff;
            --color-purple: #8000ff;
            --color-pink: #ff66b3;
            --color-red: #ff0000;
            --color-yellow: #ffff00;
            --color-lime: #80ff80;
            --color-orange: #ff6600;
          }

          .floating-input-container {
            position: fixed !important;
            bottom: 32px !important;
            width: 80vw !important;
            max-width: 800px !important;
            min-width: 350px !important;
            z-index: 1000 !important;
            /* Ẩn hoàn toàn cho đến khi mounted */
            transform: translateX(-50%) translateY(100px) !important;
            opacity: 0 !important;
            visibility: hidden !important;
            /* CHỈ transition cho transform và opacity - chậm và mượt mà hơn */
            transition: transform 1.2s cubic-bezier(0.25, 0.8, 0.25, 1), 
                       opacity 1.2s cubic-bezier(0.25, 0.8, 0.25, 1),
                       visibility 1.2s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
          }

          /* Rainbow effect cho Main Container - targeting main input container */
          .rainbow-container.rainbow-active {
            position: relative !important;
            background: ${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)'} !important;
            border-radius: 24px !important;
            border: 3px solid transparent !important;
            --bg-position: 100;
            transition: --bg-position 3s ease !important;
          }

          /* Rainbow border chạy theo background-position */
          .rainbow-container.rainbow-active::before {
            content: "" !important;
            position: absolute !important;
            top: -3px !important;
            left: -3px !important;
            right: -3px !important;
            bottom: -3px !important;
            border-radius: 27px !important;
            background: linear-gradient(
              to right,
              var(--color-white),
              var(--color-white),
              var(--color-cyan),
              var(--color-blue),
              var(--color-purple),
              var(--color-pink),
              var(--color-red),
              var(--color-yellow),
              var(--color-lime),
              var(--color-white),
              var(--color-white)
            ) no-repeat calc(var(--bg-position) * 1%) 0% / 900% !important;
            z-index: -1 !important;
            opacity: 1 !important;
          }

          /* Mask để tạo border effect */
          .rainbow-container.rainbow-active::after {
            content: "" !important;
            position: absolute !important;
            top: 0px !important;
            left: 0px !important;
            right: 0px !important;
            bottom: 0px !important;
            background: ${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)'} !important;
            border-radius: 24px !important;
            z-index: -1 !important;
          }

          /* Trigger animation khi hover hoặc active */
          .rainbow-container.rainbow-active:hover {
            --bg-position: 0;
          }

          /* Auto animation cho rainbow effect */
          .rainbow-container.rainbow-active {
            animation: rainbow-flow 3s ease infinite !important;
          }

          @keyframes rainbow-flow {
            0% { --bg-position: 100; }
            50% { --bg-position: 0; }
            100% { --bg-position: 100; }
          }

          /* Disabled state cho Main Container - không có effect */
          .rainbow-container.rainbow-disabled {
            border: 1px solid rgba(229, 231, 235, 0.8) !important;
            animation: none !important;
          }

          .rainbow-container.rainbow-disabled::before {
            display: none !important;
          }

          /* Mounted state - chỉ animate transform và opacity */
          .floating-input-container.mounted {
            transform: translateX(-50%) translateY(0) !important;
            opacity: 1 !important;
            visibility: visible !important;
          }

          /* Mobile responsive - instant positioning */
          @media (max-width: 768px) {
            .floating-input-container {
              width: calc(100vw - 32px) !important;
              min-width: 280px !important;
              bottom: 16px !important;
              /* Mobile luôn căn giữa - INSTANT positioning */
              left: 50% !important;
            }
            
            .floating-input-container.main-sider-expanded,
            .floating-input-container.main-sider-collapsed {
              /* Override tất cả MainLayout positioning trên mobile - INSTANT */
              left: 50% !important;
            }
          }

          /* Button dropdown styles */
          .button-dropdown-container {
            position: relative !important;
          }

          .button-dropdown {
            position: absolute !important;
            bottom: 50px !important;
            left: 0 !important;
            background: ${isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)'} !important;
            backdrop-filter: blur(20px) !important;
            border-radius: 12px !important;
            border: 1px solid ${isDark ? 'rgba(71, 85, 105, 0.8)' : 'rgba(229, 231, 235, 0.8)'} !important;
            box-shadow: rgba(0, 0, 0, 0.1) 0px 20px 40px, rgba(0, 0, 0, 0.05) 0px 4px 12px !important;
            padding: 8px !important;
            min-width: 150px !important;
            z-index: 1001 !important;
          }

          .button-dropdown-item {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            padding: 8px 12px !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            transition: background 0.2s !important;
            color: ${isDark ? '#e2e8f0' : '#374151'} !important;
            font-size: 14px !important;
          }

          .button-dropdown-item:hover {
            background: ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(243, 244, 246, 0.8)'} !important;
          }
        `}
      </style>

      {/* Chat Content Area - Transparent */}
      <div
        style={{
          height: 'calc(100vh - 112px - 48px)', // Tận dụng toàn bộ height vì không có header
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent', // Bỏ background để trong suốt
          borderRadius: '8px',
          overflow: 'hidden',
          margin: 0,
          padding: 0
        }}
      >
        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            position: 'relative',
            height: 0 // Force flexbox to respect flex: 1
          }}
        >
          {/* Modern Welcome Screen */}
          {showWelcome && messages.length === 0 && !(selectedTool?.key === 'booking-agents') && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                maxWidth: '800px', // Align with input box width
                margin: '0 auto',
                padding: '40px',
                background: 'transparent'
              }}
            >
              <div style={{ width: '100%', textAlign: 'left' }}>
                {/* Welcome Text */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  style={{ marginBottom: '32px' }}
                >
                  {/* Top Line: Logo + Greeting */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '12px'
                  }}>
                    <img
                      src="/logo-removebg.png"
                      alt="Logo"
                      style={{
                        width: '72px',
                        height: '72px',
                        objectFit: 'contain'
                      }}
                    />
                    <Text
                      style={{
                        fontSize: '28px',
                        fontWeight: 500,
                        color: isDark ? '#E5E7EB' : '#374151',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      Xin chào, {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'Khách'}
                    </Text>
                  </div>

                  {/* Bottom Line: Main Prompt */}
                  <Title
                    key={isDark ? 'dark' : 'light'}
                    level={1}
                    style={{
                      fontSize: '44px',
                      lineHeight: '1.2',
                      fontWeight: 400, // Regular weight as per image
                      margin: 0,
                      color: 'transparent', // Explicit transparent color for fallback
                      letterSpacing: '-0.02em',
                      background: isDark
                        ? 'linear-gradient(to right, #fff, #9ca3af)'
                        : 'linear-gradient(to right, #111827, #4b5563)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text', // Standard property
                      WebkitTextFillColor: 'transparent',
                      display: 'inline-block'
                    }}
                  >
                    Hôm nay bạn muốn khám phá điều gì?
                  </Title>
                </motion.div>
              </div>

              {/* Inline Chat Input - Hiển thị ngay dưới welcome text - Chỉ khi chưa có tin nhắn */}
              <AnimatePresence>
                {messages.length === 0 && (
                  <motion.div
                    layoutId="chat-input"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{
                      y: window.innerHeight - 200,
                      opacity: 0.3,
                      transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] }
                    }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    style={{
                      width: '100%',
                      maxWidth: '800px',
                      marginBottom: '40px'
                    }}
                  >
                    {/* Main Input Container với Rainbow Effect - Khôi phục từ floating input */}
                    <div
                      className={`rainbow-container ${showRainbowEffect ? 'rainbow-active' : 'rainbow-disabled'}`}
                      style={{
                        background: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '16px',
                        border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.6)'}`,
                        boxShadow: isDark
                          ? '0 8px 24px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.15)'
                          : '0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                        padding: '12px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {/* Top Row - Input Only */}
                      <div style={{ width: '100%' }}>
                        <TextArea
                          value={inputValue}
                          onChange={handleInputChange}
                          onPressEnter={handleKeyPress}
                          placeholder={selectedTool ? `Hỏi ${selectedTool.label}...` : "Hỏi tôi bất cứ điều gì..."}
                          autoSize={{ minRows: 1, maxRows: 4 }}
                          disabled={loading}
                          bordered={false}
                          style={{
                            fontSize: '16px',
                            lineHeight: '1.5',
                            resize: 'none',
                            backgroundColor: 'transparent',
                            color: isDark ? '#F9FAFB' : '#111827',
                            padding: '6px 10px',
                            boxShadow: 'none',
                            border: 'none',
                            width: '100%'
                          }}
                          className="transparent-textarea"
                        />
                      </div>

                      {/* Bottom Row - Actions and Send Button */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '2px'
                      }}>
                        {/* Left Side - Action Icons and Selected Tool */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Attach File Icon */}
                          <Button
                            type="text"
                            icon={<PaperClipOutlined />}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: isDark ? '#9CA3AF' : '#6B7280',
                              padding: '8px',
                              borderRadius: '12px',
                              transition: 'all 0.2s ease',
                              boxShadow: 'none',
                              width: '44px',
                              height: '44px',
                              fontSize: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            className="attach-icon-button"
                            onClick={() => {
                              // Handle file attach
                            }}
                          />

                          {/* Selected Tool Display */}
                          {selectedTool && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '14px',
                                color: '#2563EB',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onClick={handleClearTool}
                              className="selected-tool-display"
                            >
                              <span style={{ fontSize: '14px', transition: 'all 0.2s ease' }} className="tool-icon">
                                {selectedTool.icon}
                              </span>
                              <span>{selectedTool.label}</span>
                            </div>
                          )}
                        </div>

                        {/* Right Side - Tools and Send Button */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Tools Dropdown */}
                          <Dropdown
                            menu={{
                              items: [
                                {
                                  key: 'web-search',
                                  label: (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                      <span>Tìm Kiếm Web</span>
                                      <Tooltip title="Tìm kiếm thông tin thời gian thực và dữ liệu hiện tại trên internet" placement="right">
                                        <InfoCircleOutlined style={{ fontSize: '10px', color: isDark ? '#6B7280' : '#9CA3AF', marginLeft: '8px', transform: 'translateY(-1px)' }} />
                                      </Tooltip>
                                    </div>
                                  ),
                                  icon: <GlobalOutlined />,
                                  onClick: () => handleWebSearch()
                                },
                                {
                                  key: 'deep-research',
                                  label: (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                      <span>Nghiên Cứu Sâu</span>
                                      <Tooltip title="Thực hiện phân tích toàn diện qua nhiều nguồn và cơ sở dữ liệu" placement="right">
                                        <InfoCircleOutlined style={{ fontSize: '10px', color: isDark ? '#6B7280' : '#9CA3AF', marginLeft: '8px', transform: 'translateY(-1px)' }} />
                                      </Tooltip>
                                    </div>
                                  ),
                                  icon: <SearchOutlined />,
                                  onClick: () => handleDeepResearch()
                                },
                                {
                                  key: 'booking-agents',
                                  label: (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                      <span>Agent Đặt Phòng</span>
                                      <Tooltip title="Truy cập đại lý chuyên nghiệp cho đặt vé máy bay, khách sạn và gói du lịch" placement="right">
                                        <InfoCircleOutlined style={{ fontSize: '10px', color: isDark ? '#6B7280' : '#9CA3AF', marginLeft: '8px', transform: 'translateY(-1px)' }} />
                                      </Tooltip>
                                    </div>
                                  ),
                                  icon: <BankOutlined />,
                                  onClick: () => handleBookingAgents()
                                }
                              ]
                            }}
                            trigger={['click']}
                            placement="topRight"
                          >
                            <Button
                              type="text"
                              style={{
                                border: 'none',
                                background: 'none',
                                color: isDark ? '#9CA3AF' : '#6B7280',
                                padding: '8px 12px',
                                borderRadius: '12px',
                                transition: 'all 0.2s ease',
                                fontSize: '15px',
                                height: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              className="tools-dropdown-button"
                            >
                              <ToolOutlined style={{ fontSize: '16px' }} />
                              <span>Công Cụ</span>
                              <DownOutlined style={{ fontSize: '12px' }} />
                            </Button>
                          </Dropdown>

                          {/* Send Button */}
                          <Button
                            type="primary"
                            size="large"
                            icon={<SendOutlined />}
                            onClick={() => handleSendMessage()}
                            loading={loading}
                            disabled={!inputValue.trim()}
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '12px',
                              border: 'none',
                              background: inputValue.trim()
                                ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                                : isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(243, 244, 246, 0.8)',
                              color: inputValue.trim() ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280'),
                              boxShadow: inputValue.trim()
                                ? '0 4px 12px rgba(59, 130, 246, 0.4)'
                                : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              transition: 'all 0.2s ease'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Feature Cards */}

            </div>
          )}



          {/* Booking Form View - Only show when tool selected and no messages */}
          {(selectedTool?.key === 'booking-agents' || isBookingFormVisible) && messages.length === 0 && (
            <div style={{
              padding: '24px 16px 200px 16px', // Added large padding bottom to prevent input bar overlap
              maxWidth: '800px',
              margin: '0 auto',
              width: '100%',
              height: '100%',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'center',
              zIndex: 10
            }}>
              <BookingForm onSubmit={handleBookingSubmit} loading={loading} />
            </div>
          )}

          {/* Messages List - Show if not in booking form mode OR if there are messages OR loading */}
          {!showWelcome && (!((selectedTool?.key === 'booking-agents' || isBookingFormVisible) && messages.length === 0) || loading) && (
            <div
              style={{
                maxWidth: '1400px',
                margin: '0 auto',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div className="messages-scroll-container" style={{
                flex: 1,
                overflowY: 'auto',
                paddingRight: '8px',
                paddingBottom: '160px',
                scrollBehavior: 'smooth'
              }}>
                <AnimatePresence>
                  {messages.map((message, index) => {
                    // 🔍 DEBUG: Log message to see sender value
                    if (message.content.includes('Agent đang nhắn tin')) {
                      console.log('🔍 [DEBUG] Agent message:', {
                        id: message.id,
                        sender: message.sender,
                        content: message.content.substring(0, 100)
                      });
                    }

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        style={{
                          display: 'flex',
                          justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                          marginBottom: '24px'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                            maxWidth: '90%',
                            flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                          }}
                        >
                          <Avatar
                            size={40}
                            style={{
                              background: message.sender === 'user'
                                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              flexShrink: 0
                            }}
                            icon={message.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
                          />

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '100%' }}>
                            {/* Action Badge for Agent Messages */}
                            {(() => {
                              try {
                                // Check if message starts with (Agent...) and extracts action + content
                                const agentActionMatch = message.content.match(/^\((.*?)\):\s*"?([\s\S]+?)"?$/);
                                if (agentActionMatch && message.sender === 'user') {
                                  return (
                                    <div style={{
                                      alignSelf: 'flex-end',
                                      marginBottom: '4px',
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      background: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                                      border: `1px solid ${isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
                                      color: isDark ? '#a5b4fc' : '#4f46e5',
                                      fontSize: '11px',
                                      fontWeight: '500',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}>
                                      <RobotOutlined style={{ fontSize: '12px' }} />
                                      {agentActionMatch[1]}
                                    </div>
                                  );
                                }
                              } catch (e) {
                                console.error('Error parsing agent action:', e);
                              }
                              return null;
                            })()}

                            <Card
                              style={{
                                background: message.sender === 'user'
                                  ? (isDark ? '#6366f1' : '#6366f1')
                                  : (isDark ? 'rgba(51, 65, 85, 0.8)' : '#ffffff'),
                                border: 'none',
                                borderRadius: '16px',
                                boxShadow: isDark
                                  ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(10px)'
                              }}
                              bodyStyle={{
                                padding: '16px 20px',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: message.sender === 'user' ? '#ffffff' : 'inherit',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                hyphens: 'auto'
                              }}
                            >
                              {message.sender === 'user' ? (
                                <div style={{ whiteSpace: 'pre-wrap' }}>
                                  {(() => {
                                    const match = message.content.match(/^\((.*?)\):\s*"?([\s\S]+?)"?$/);
                                    return match ? match[2].replace(/^"|"$/g, '') : message.content;
                                  })()}
                                </div>
                              ) : (
                                <>
                                  {message.thinking && (
                                    <Collapse
                                      size="small"
                                      bordered={false}
                                      style={{
                                        background: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(255, 215, 0, 0.1)',
                                        marginBottom: '12px',
                                        borderRadius: '8px'
                                      }}
                                      items={[{
                                        key: 'thinking',
                                        label: (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', color: isDark ? '#FFD700' : '#B8860B' }}>
                                            <BulbOutlined />
                                            <span>Suy nghĩ của AI</span>
                                          </div>
                                        ),
                                        children: (
                                          <div style={{
                                            padding: '8px 0',
                                            fontSize: '13px',
                                            lineHeight: '1.6',
                                            color: isDark ? '#D1D5DB' : '#4B5563',
                                            fontStyle: 'italic',
                                            maxHeight: '200px',
                                            overflow: 'auto'
                                          }}>
                                            {message.thinking}
                                          </div>
                                        )
                                      }]}
                                    />
                                  )}
                                  <ReactMarkdown
                                    components={{
                                      // Custom styling for markdown elements
                                      h1: ({ children }) => <h1 style={{ color: isDark ? '#F9FAFB' : '#111827', marginBottom: '12px' }}>{children}</h1>,
                                      h2: ({ children }) => <h2 style={{ color: isDark ? '#F9FAFB' : '#111827', marginBottom: '10px' }}>{children}</h2>,
                                      h3: ({ children }) => <h3 style={{ color: isDark ? '#F9FAFB' : '#111827', marginBottom: '8px' }}>{children}</h3>,
                                      p: ({ children }) => <p style={{ marginBottom: '8px', lineHeight: '1.6' }}>{children}</p>,
                                      ul: ({ children }) => <ul style={{ marginLeft: '20px', marginBottom: '8px' }}>{children}</ul>,
                                      ol: ({ children }) => <ol style={{ marginLeft: '20px', marginBottom: '8px' }}>{children}</ol>,
                                      li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
                                      strong: ({ children }) => <strong style={{ fontWeight: '600' }}>{children}</strong>,
                                      em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
                                      code: ({ children }) => (
                                        <code style={{
                                          background: isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(243, 244, 246, 0.8)',
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          fontFamily: 'monospace',
                                          fontSize: '0.9em'
                                        }}>
                                          {children}
                                        </code>
                                      ),
                                      pre: ({ children }) => (
                                        <pre style={{
                                          background: isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(243, 244, 246, 0.8)',
                                          padding: '12px',
                                          borderRadius: '8px',
                                          overflow: 'auto',
                                          marginBottom: '12px'
                                        }}>
                                          {children}
                                        </pre>
                                      ),
                                      a: ({ children, href }) => (
                                        <a
                                          href={href}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{
                                            color: isDark ? '#60A5FA' : '#2563EB',
                                            textDecoration: 'underline'
                                          }}
                                        >
                                          {children}
                                        </a>
                                      )
                                    }}
                                  >
                                    {message.content}
                                  </ReactMarkdown>

                                  {/* Sources Component */}
                                  {message.sources && message.sources.length > 0 && (
                                    <div style={{
                                      marginTop: '12px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '6px 8px',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      border: '1px solid transparent'
                                    }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.border = `1px solid ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(209, 213, 219, 0.8)'}`;
                                        e.currentTarget.style.background = isDark ? 'rgba(71, 85, 105, 0.2)' : 'rgba(243, 244, 246, 0.5)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.border = '1px solid transparent';
                                        e.currentTarget.style.background = 'transparent';
                                      }}
                                      onClick={() => {
                                        // Show sources sidebar
                                        setSidebarSources(message.sources || []);
                                        setShowSourcesSidebar(true);
                                      }}
                                    >
                                      {/* Clustered Favicons */}
                                      <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginLeft: '-4px'
                                      }}>
                                        {message.sources.slice(0, 3).map((source, index) => {
                                          try {
                                            // Use source.title as domain (source.uri is Google redirect URL)
                                            const domain = source.title.replace('www.', '');
                                            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;

                                            return (
                                              <div
                                                key={index}
                                                style={{
                                                  marginLeft: index === 0 ? '0' : '-4px',
                                                  zIndex: message.sources!.length - index,
                                                  display: 'block'
                                                }}
                                              >
                                                <img
                                                  src={faviconUrl}
                                                  alt=""
                                                  style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    borderRadius: '50%',
                                                    border: `1px solid ${isDark ? '#1f2937' : '#ffffff'}`,
                                                    background: isDark ? '#1f2937' : '#ffffff'
                                                  }}
                                                  onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                  }}
                                                />
                                              </div>
                                            );
                                          } catch (error) {
                                            return null;
                                          }
                                        })}
                                        {message.sources.length > 3 && (
                                          <div style={{
                                            marginLeft: '-4px',
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '50%',
                                            backgroundColor: isDark ? '#374151' : '#E5E7EB',
                                            border: `1px solid ${isDark ? '#1f2937' : '#ffffff'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '8px',
                                            fontWeight: '600',
                                            color: isDark ? '#D1D5DB' : '#6B7280',
                                            zIndex: 0
                                          }}>
                                            +{message.sources.length - 3}
                                          </div>
                                        )}
                                      </div>

                                      {/* Text */}
                                      <span style={{
                                        color: isDark ? '#9CA3AF' : '#6B7280',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                      }}>
                                        {message.sources.length > 1 ? `${message.sources.length} Nguồn` : 'Nguồn'}
                                      </span>
                                    </div>
                                  )}
                                </>
                              )}

                            </Card>

                            {/* Payment Request Invoice UI */}
                            {(() => {
                              // 🔍 DEBUG: Check why payment card not showing
                              const shouldShowPayment = message.type === 'booking_payment_request' && message.data;
                              if (message.content?.includes?.('thanh toán') || message.content?.includes?.('Invoice')) {
                                console.log('💳 [DEBUG RENDER] Payment card check:', {
                                  messageId: message.id,
                                  hasCorrectType: message.type === 'booking_payment_request',
                                  actualType: message.type,
                                  hasData: !!message.data,
                                  dataKeys: message.data ? Object.keys(message.data) : null,
                                  willRender: shouldShowPayment
                                });
                              }
                              return shouldShowPayment;
                            })() && (
                                <div style={{ marginTop: '12px' }}>
                                  <Card
                                    style={{
                                      maxWidth: '420px',
                                      border: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.3)' : '#e5e7eb'}`,
                                      borderRadius: '16px',
                                      boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)',
                                      background: isDark ? 'rgba(51, 65, 85, 0.5)' : '#ffffff',
                                      overflow: 'hidden'
                                    }}
                                    bodyStyle={{ padding: 0 }}
                                  >
                                    {/* Header with Icon */}
                                    <div style={{
                                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                      padding: '24px',
                                      textAlign: 'center',
                                      color: 'white'
                                    }}>
                                      <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 12px'
                                      }}>
                                        <DollarOutlined style={{ fontSize: '24px', color: 'white' }} />
                                      </div>
                                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                                        Invoice #DT{message.id.slice(-6)}
                                      </div>
                                      <div style={{ fontSize: '13px', opacity: 0.9 }}>
                                        Yêu Cầu Thanh Toán Đặt Phòng
                                      </div>
                                    </div>

                                    {/* Info Section */}
                                    <div style={{ padding: '20px' }}>
                                      {/* Dates Grid */}
                                      <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr 1fr',
                                        gap: '12px',
                                        marginBottom: '20px',
                                        paddingBottom: '16px',
                                        borderBottom: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.3)' : '#f3f4f6'}`
                                      }}>
                                        <div>
                                          <div style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280', marginBottom: '4px' }}>Issued on</div>
                                          <div style={{ fontSize: '13px', fontWeight: '500', color: isDark ? '#e5e7eb' : '#111827' }}>
                                            {new Date(message.timestamp).toLocaleDateString('vi-VN')}
                                          </div>
                                        </div>
                                        <div>
                                          <div style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280', marginBottom: '4px' }}>Due on</div>
                                          <div style={{ fontSize: '13px', fontWeight: '500', color: isDark ? '#e5e7eb' : '#111827' }}>
                                            {new Date(new Date(message.timestamp).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}
                                          </div>
                                        </div>
                                        <div>
                                          <div style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280', marginBottom: '4px' }}>Status</div>
                                          <div style={{
                                            display: 'inline-block',
                                            fontSize: '11px',
                                            fontWeight: '500',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            background: message.paymentStatus === 'approved' ? '#dcfce7' : message.paymentStatus === 'rejected' ? '#fee2e2' : '#fef3c7',
                                            color: message.paymentStatus === 'approved' ? '#166534' : message.paymentStatus === 'rejected' ? '#991b1b' : '#854d0e'
                                          }}>
                                            {message.paymentStatus === 'approved' ? '✓ Approved' : message.paymentStatus === 'rejected' ? '✗ Rejected' : '● Pending'}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Invoice Items */}
                                      <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: isDark ? '#e5e7eb' : '#111827', marginBottom: '12px' }}>
                                          Invoice Items
                                        </div>
                                        <div style={{
                                          background: isDark ? 'rgba(71, 85, 105, 0.2)' : '#f9fafb',
                                          borderRadius: '8px',
                                          padding: '12px'
                                        }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div style={{ fontSize: '13px', color: isDark ? '#d1d5db' : '#4b5563', flex: 1, marginRight: '16px' }}>
                                              {(message.data as any).description || 'Đặt cọc phòng khách sạn'}
                                            </div>
                                            <div style={{ fontSize: '13px', fontWeight: '500', color: isDark ? '#e5e7eb' : '#111827', whiteSpace: 'nowrap' }}>
                                              {(() => {
                                                const amount = (message.data as any)?.amount || (message.data as any)?.paymentInfo?.amount;
                                                return amount ? amount.toLocaleString('vi-VN') : '—';
                                              })()} VND
                                            </div>
                                          </div>
                                          <div style={{
                                            paddingTop: '8px',
                                            borderTop: `1px dashed ${isDark ? 'rgba(156, 163, 175, 0.3)' : '#d1d5db'}`,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontWeight: '600'
                                          }}>
                                            <div style={{ fontSize: '14px', color: isDark ? '#e5e7eb' : '#111827' }}>Total</div>
                                            <div style={{ fontSize: '16px', color: '#6366f1' }}>
                                              {(() => {
                                                const amount = (message.data as any)?.amount || (message.data as any)?.paymentInfo?.amount;
                                                return amount ? amount.toLocaleString('vi-VN') : '—';
                                              })()} VND
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Action Buttons or Status */}
                                      {message.paymentStatus === 'approved' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f0fdf4', borderRadius: '8px' }}>
                                          <CheckCircleOutlined style={{ fontSize: '20px', color: '#10b981' }} />
                                          <div style={{ color: '#059669', fontWeight: '500', fontSize: '13px' }}>Đã phê duyệt thanh toán</div>
                                        </div>
                                      ) : message.paymentStatus === 'rejected' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#fef2f2', borderRadius: '8px' }}>
                                          <CloseCircleOutlined style={{ fontSize: '20px', color: '#ef4444' }} />
                                          <div style={{ color: '#dc2626', fontWeight: '500', fontSize: '13px' }}>Đã từ chối thanh toán</div>
                                        </div>
                                      ) : (
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                          <Button
                                            type="primary"
                                            block
                                            size="large"
                                            icon={<CheckCircleOutlined />}
                                            style={{
                                              background: '#6366f1',
                                              borderColor: '#6366f1',
                                              height: '44px',
                                              fontWeight: '500'
                                            }}
                                            onClick={async () => {
                                              setMessages(prev => prev.map(m => m.id === message.id ? { ...m, paymentStatus: 'approved' as const } : m));
                                              if (sessionId) {
                                                await chatService.addMessage(sessionId, 'system', 'Đã phê duyệt thanh toán', {
                                                  messageId: message.id,
                                                  paymentStatus: 'approved',
                                                  action: 'payment_approved'
                                                }).catch(err => console.error('Failed to save approval:', err));
                                              }
                                              setLoading(true);
                                              await bookingApi.queryAgent({
                                                sessionId: sessionId!,
                                                userId: user?.id || '',
                                                message: '✅ XÁC NHẬN ĐẶT PHÒNG',
                                                history: messages.map(m => ({ role: m.sender, content: m.content, timestamp: m.timestamp.toISOString() }))
                                              });
                                              setLoading(false);
                                            }}
                                          >
                                            Phê duyệt
                                          </Button>
                                          <Button
                                            danger
                                            block
                                            size="large"
                                            icon={<CloseCircleOutlined />}
                                            style={{ height: '44px', fontWeight: '500' }}
                                            onClick={async () => {
                                              setMessages(prev => prev.map(m => m.id === message.id ? { ...m, paymentStatus: 'rejected' as const } : m));
                                              if (sessionId) {
                                                await chatService.addMessage(sessionId, 'system', 'Đã từ chối thanh toán', {
                                                  messageId: message.id,
                                                  paymentStatus: 'rejected',
                                                  action: 'payment_rejected'
                                                }).catch(err => console.error('Failed to save rejection:', err));
                                              }
                                              handleSendMessage('Tôi từ chối thanh toán khoản này.');
                                            }}
                                          >
                                            Từ chối
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                </div>
                              )}
                          </div>

                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Deep Research Component */}
                {isDeepResearchActive && (
                  <DeepResearchComponent
                    query={deepResearchQuery}
                    userId={user?.id}
                    sessionId={sessionId}
                    onResult={handleDeepResearchResult}
                    onError={handleDeepResearchError}
                  />
                )}

                {/* Simple Loading Spinner - Only show when loading with no messages */}
                {loading && messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '200px'
                    }}
                  >
                    <LoadingOutlined style={{ fontSize: 48, color: '#10b981' }} />
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

            </div>
          )}
        </div>
      </div>


      {/* Floating Input Footer - Modern Design với Animation - ALWAYS visible */}
      {!showWelcome && (
        <div
          className={`floating-input-container ${isLayoutReady && isInputMounted ? 'mounted' : ''}`}
          style={{
            left: getLeftPosition(), // Set left position bằng JavaScript
          }}
        >
          {/* Main Input Container với Rainbow Effect */}
          <motion.div
            layoutId="chat-input"
            className={`rainbow-container ${showRainbowEffect ? 'rainbow-active' : 'rainbow-disabled'}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            style={{
              background: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.6)'}`,
              boxShadow: isDark
                ? '0 8px 24px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.15)'
                : '0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {/* Top Row - Input Only */}
            <div style={{ width: '100%' }}>
              <TextArea
                value={inputValue}
                onChange={handleInputChange}
                onPressEnter={handleKeyPress}
                placeholder={selectedTool ? `Hỏi ${selectedTool.label}...` : "Hỏi tôi bất cứ điều gì..."}
                autoSize={{ minRows: 1, maxRows: 4 }}
                disabled={loading}
                bordered={false}
                style={{
                  fontSize: '16px',
                  lineHeight: '1.5',
                  resize: 'none',
                  backgroundColor: 'transparent',
                  color: isDark ? '#F9FAFB' : '#111827',
                  padding: '6px 10px',
                  boxShadow: 'none',
                  border: 'none',
                  width: '100%'
                }}
                className="transparent-textarea"
              />
            </div>

            {/* Bottom Row - Actions and Send Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '2px'
            }}>
              {/* Left Side - Action Icons and Selected Tool */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Attach File Icon */}
                <Button
                  type="text"
                  icon={<PaperClipOutlined />}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: isDark ? '#9CA3AF' : '#6B7280',
                    padding: '8px',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    boxShadow: 'none',
                    width: '44px',
                    height: '44px',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  className="attach-icon-button"
                  onClick={() => {
                    // Handle file attach
                  }}
                />

                {/* Selected Tool Display */}
                {selectedTool && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      color: '#2563EB',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={handleClearTool}
                    className="selected-tool-display"
                  >
                    <span style={{ fontSize: '14px', transition: 'all 0.2s ease' }} className="tool-icon">
                      {selectedTool.icon}
                    </span>
                    <span>{selectedTool.label}</span>
                  </div>
                )}
              </div>

              {/* Right Side - Tools and Send Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Tools Dropdown */}
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'web-search',
                        label: (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span>Tìm Kiếm Web</span>
                            <Tooltip title="Tìm kiếm thông tin thời gian thực và dữ liệu hiện tại trên internet" placement="right">
                              <InfoCircleOutlined style={{ fontSize: '10px', color: isDark ? '#6B7280' : '#9CA3AF', marginLeft: '8px', transform: 'translateY(-1px)' }} />
                            </Tooltip>
                          </div>
                        ),
                        icon: <GlobalOutlined />,
                        onClick: () => handleWebSearch()
                      },
                      {
                        key: 'deep-research',
                        label: (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span>Nghiên Cứu Sâu</span>
                            <Tooltip title="Thực hiện phân tích toàn diện qua nhiều nguồn và cơ sở dữ liệu" placement="right">
                              <InfoCircleOutlined style={{ fontSize: '10px', color: isDark ? '#6B7280' : '#9CA3AF', marginLeft: '8px', transform: 'translateY(-1px)' }} />
                            </Tooltip>
                          </div>
                        ),
                        icon: <SearchOutlined />,
                        onClick: () => handleDeepResearch()
                      },
                      {
                        key: 'booking-agents',
                        label: (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span>Agent Đặt Phòng</span>
                            <Tooltip title="Truy cập đại lý chuyên nghiệp cho đặt vé máy bay, khách sạn và gói du lịch" placement="right">
                              <InfoCircleOutlined style={{ fontSize: '10px', color: isDark ? '#6B7280' : '#9CA3AF', marginLeft: '8px', transform: 'translateY(-1px)' }} />
                            </Tooltip>
                          </div>
                        ),
                        icon: <BankOutlined />,
                        onClick: () => handleBookingAgents()
                      }
                    ]
                  }}
                  trigger={['click']}
                  placement="topRight"
                >
                  <Button
                    type="text"
                    style={{
                      border: 'none',
                      background: 'none',
                      color: isDark ? '#9CA3AF' : '#6B7280',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease',
                      fontSize: '15px',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    className="tools-dropdown-button"
                  >
                    <ToolOutlined style={{ fontSize: '16px' }} />
                    <span>Công Cụ</span>
                    <DownOutlined style={{ fontSize: '12px' }} />
                  </Button>
                </Dropdown>

                {/* Send Button */}
                <Button
                  type="primary"
                  size="large"
                  icon={<SendOutlined />}
                  onClick={() => handleSendMessage()}
                  loading={loading}
                  disabled={!inputValue.trim()}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    border: 'none',
                    background: inputValue.trim()
                      ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                      : isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(243, 244, 246, 0.8)',
                    color: inputValue.trim() ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280'),
                    boxShadow: inputValue.trim()
                      ? '0 4px 12px rgba(59, 130, 246, 0.4)'
                      : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
            </div>

          </motion.div>

          {/* Bottom Disclaimer */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '12px',
              fontSize: '11px',
              color: isDark ? '#6B7280' : '#9CA3AF',
              lineHeight: '1.4'
            }}
          >
            Travel AI có thể hiển thị thông tin không chính xác, vui lòng kiểm tra lại phản hồi.{' '}
            <a
              href="#"
              style={{
                color: isDark ? '#60A5FA' : '#3B82F6',
                textDecoration: 'none'
              }}
            >
              Quyền riêng tư & Travel AI
            </a>
          </div>
        </div>
      )
      }

      {/* Chat Sidebar */}
      <ChatSidebar
        onToggle={setIsSidebarOpen}
        forceClose={windowWidth < 900}
      />

      {/* Sources Sidebar */}
      {
        showSourcesSidebar && (
          <div
            style={{
              position: 'fixed',
              top: '0',
              right: '0',
              width: '350px',
              height: '100vh',
              background: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'}`,
              borderRight: 'none',
              zIndex: 1001,
              padding: '20px',
              overflowY: 'auto',
              boxShadow: isDark
                ? '0 -20px 25px -5px rgba(0, 0, 0, 0.3), 0 -10px 10px -5px rgba(0, 0, 0, 0.2)'
                : '0 -20px 25px -5px rgba(0, 0, 0, 0.1), 0 -10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'}`
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: isDark ? '#F9FAFB' : '#111827'
              }}>
                Trích dẫn
              </h3>
              <button
                onClick={() => setShowSourcesSidebar(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  padding: '5px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Sources List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sidebarSources.map((source, index) => {
                try {
                  // Use source.title as domain (source.uri is Google redirect URL)
                  const domain = source.title.replace('www.', '');
                  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=24`;

                  return (
                    <a
                      key={index}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        background: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(243, 244, 246, 0.5)',
                        border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'}`,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark ? 'rgba(75, 85, 99, 0.4)' : 'rgba(243, 244, 246, 0.8)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(243, 244, 246, 0.5)';
                        e.currentTarget.style.transform = 'translateY(0px)';
                      }}
                    >
                      <img
                        src={faviconUrl}
                        alt=""
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}
                        onError={(e) => {
                          e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="12" fill="${isDark ? '#374151' : '#E5E7EB'}"/>
                            <text x="12" y="16" text-anchor="middle" fill="${isDark ? '#D1D5DB' : '#6B7280'}" font-size="10" font-family="Arial">W</text>
                          </svg>
                        `)}`;
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          color: isDark ? '#F3F4F6' : '#111827',
                          fontSize: '14px',
                          fontWeight: '500',
                          lineHeight: '1.4',
                          marginBottom: '4px'
                        }}>
                          {domain}
                        </div>
                        <div style={{
                          color: isDark ? '#9CA3AF' : '#6B7280',
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          https://{domain}
                        </div>
                      </div>
                    </a>
                  );
                } catch (error) {
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        background: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(243, 244, 246, 0.5)',
                        border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'}`
                      }}
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: isDark ? '#374151' : '#E5E7EB',
                          flexShrink: 0
                        }}
                      />
                      <div style={{
                        color: isDark ? '#9CA3AF' : '#6B7280',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        Nguồn {index + 1}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )
      }

      {/* Overlay to close sidebar when clicking outside */}
      {
        showSourcesSidebar && (
          <div
            style={{
              position: 'fixed',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: 'rgba(0, 0, 0, 0.1)',
              zIndex: 1000
            }}
            onClick={() => setShowSourcesSidebar(false)}
          />
        )
      }

      {/* Payment Confirmation Modal */}
      {currentPaymentInfo && (
        <PaymentConfirmationModal
          visible={isPaymentModalVisible}
          paymentInfo={currentPaymentInfo}
          onConfirm={handlePaymentConfirm}
          onReject={handlePaymentReject}
          loading={paymentConfirmLoading}
        />
      )}
    </>
  );
};

export default ChatPageContent;