import React, { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Tag, Space, Spin, notification, Collapse } from 'antd';
import { RobotOutlined, BulbOutlined, SearchOutlined, CheckOutlined, LoadingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { deepResearchService, DeepResearchStreamEvent } from '../services/deep-research.service';
import { useTheme } from '../contexts/ThemeContext';

const { Text } = Typography;

// Interface matching new backend sources
interface SourceInfo {
  title: string;
  uri: string;
}

interface DeepResearchComponentProps {
  query: string;
  userId?: string;
  sessionId?: string;
  onResult: (result: { content: string; sources: SourceInfo[]; thinking?: string }) => void;
  onError: (error: string) => void;
}

export const DeepResearchComponent: React.FC<DeepResearchComponentProps> = ({
  query,
  userId,
  sessionId,
  onResult,
  onError
}) => {
  const { isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState<'start' | 'thinking' | 'searching' | 'content' | 'complete'>('start');
  const [thinkingText, setThinkingText] = useState('');
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);
  const [currentStepText, setCurrentStepText] = useState('Đang khởi động...');
  const [sources, setSources] = useState<SourceInfo[]>([]);

  // Typewriter animation state
  const [pendingChars, setPendingChars] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (pendingChars.length === 0 || isAnimating) return;

    setIsAnimating(true);
    const animateTypewriter = () => {
      setPendingChars(prev => {
        if (prev.length === 0) {
          setIsAnimating(false);
          return prev;
        }

        // Display 3 chars per frame
        const charsToAdd = prev.slice(0, 3);
        setDisplayedContent(current => current + charsToAdd.join(''));

        const remaining = prev.slice(3);
        if (remaining.length > 0) {
          setTimeout(animateTypewriter, 12);
        } else {
          setIsAnimating(false);
        }
        return remaining;
      });
    };

    animateTypewriter();
  }, [pendingChars.length, isAnimating]);

  useEffect(() => {
    // Request notification permission on component mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const processDeepResearch = async () => {
      try {
        let fullContent = '';
        let finalSources: SourceInfo[] = [];
        let accumulatedThinking = '';

        // Pass userId and sessionId for memory integration
        for await (const event of deepResearchService.searchWithStreamParsed(query, userId, sessionId)) {
          switch (event.type) {
            case 'start':
              setCurrentStep('start');
              setCurrentStepText('Đang khởi động nghiên cứu sâu...');
              break;

            case 'thinking':
              setCurrentStep('thinking');
              setCurrentStepText('Đang suy nghĩ...');
              if (event.content) {
                setThinkingText(prev => prev + event.content);
                accumulatedThinking += event.content;
              }
              break;

            case 'search_query':
              setCurrentStep('searching');
              setCurrentStepText('Đang tìm kiếm thông tin...');
              if (event.content) {
                setSearchQueries(prev => [...prev, event.content!]);
              }
              break;

            case 'content':
              setCurrentStep('content');
              setCurrentStepText('Đang tổng hợp thông tin...');
              if (event.content) {
                fullContent += event.content;
                // Add to typewriter queue
                setPendingChars(prev => [...prev, ...event.content!.split('')]);
              }
              break;

            case 'sources':
              if (event.sources) {
                finalSources = event.sources;
                setSources(finalSources);
              }
              break;

            case 'done':
              setCurrentStep('complete');
              setCurrentStepText('Hoàn thành nghiên cứu!');
              setIsProcessing(false);

              // Wait for typewriter to finish
              const waitForTypewriter = () => {
                return new Promise<void>(resolve => {
                  const check = () => {
                    if (pendingChars.length === 0 && !isAnimating) {
                      resolve();
                    } else {
                      setTimeout(check, 100);
                    }
                  };
                  check();
                });
              };

              await waitForTypewriter();

              // Show completion notifications
              notification.success({
                message: 'Báo cáo đã sẵn sàng!',
                description: 'Nghiên cứu sâu đã hoàn tất.',
                placement: 'topRight',
                duration: 4
              });

              // Show system notification (desktop)
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('GoJourney - Nghiên cứu sâu hoàn tất!', {
                  body: 'Báo cáo đã sẵn sàng.',
                  icon: '/favicon.ico',
                  tag: 'deep-research-complete'
                });
              }

              // Delay before calling onResult
              setTimeout(() => {
                onResult({
                  content: fullContent,
                  sources: finalSources,
                  thinking: accumulatedThinking // Pass accumulated thinking text
                });
              }, 500);
              break;

            case 'error':
              setIsProcessing(false);
              onError(event.error || 'Unknown error occurred');
              break;
          }
        }

      } catch (error) {
        setIsProcessing(false);
        console.error('Deep research error:', error);
        onError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    };

    processDeepResearch();
  }, [query]);

  // Spinning icon wrapper using framer-motion
  const SpinningIcon = ({ children, isSpinning = true }: { children: React.ReactNode; isSpinning?: boolean }) => (
    <motion.div
      animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
      transition={isSpinning ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {children}
    </motion.div>
  );

  const getStepIcon = (step: string) => {
    const isSpinning = isProcessing && step !== 'complete';

    switch (step) {
      case 'start':
        return <SpinningIcon isSpinning={isSpinning}><LoadingOutlined style={{ fontSize: 16, color: '#6366f1' }} /></SpinningIcon>;
      case 'thinking':
        return <SpinningIcon isSpinning={isSpinning}><BulbOutlined style={{ fontSize: 16, color: '#FFD700' }} /></SpinningIcon>;
      case 'searching':
        return <SpinningIcon isSpinning={isSpinning}><SearchOutlined style={{ fontSize: 16, color: '#1890ff' }} /></SpinningIcon>;
      case 'content':
        return <SpinningIcon isSpinning={isSpinning}><LoadingOutlined style={{ fontSize: 16, color: '#52c41a' }} /></SpinningIcon>;
      case 'complete':
        return <CheckOutlined style={{ color: '#52c41a', fontSize: 16 }} />;
      default:
        return <BulbOutlined style={{ fontSize: 16 }} />;
    }
  };

  const getLoadingIcon = () => (
    <SpinningIcon isSpinning={isProcessing}>
      <LoadingOutlined style={{ fontSize: 16, color: '#6366f1' }} />
    </SpinningIcon>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
        <Avatar
          size={40}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            flexShrink: 0
          }}
          icon={<RobotOutlined />}
        />

        <Card
          style={{
            flex: 1,
            background: isDark ? 'rgba(51, 65, 85, 0.8)' : '#ffffff',
            border: 'none',
            borderRadius: '16px',
            boxShadow: isDark
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
          styles={{ body: { padding: '20px' } }}
        >
          {/* Header */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              {/* Static bulb icon for title */}
              <BulbOutlined style={{ fontSize: 16, color: '#FFD700' }} />
              <Text strong style={{
                fontSize: '16px',
                color: isDark ? '#F3F4F6' : '#111827'
              }}>
                Nghiên Cứu Sâu
              </Text>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              {/* Loading icon when processing, checkmark when complete */}
              {isProcessing ? (
                <SpinningIcon isSpinning={true}>
                  <LoadingOutlined style={{ fontSize: 14, color: '#6366f1' }} />
                </SpinningIcon>
              ) : (
                <CheckOutlined style={{ fontSize: 14, color: '#22c55e' }} />
              )}
              <Text type="secondary" style={{ fontSize: '14px' }}>
                {currentStepText}
              </Text>
            </div>
          </div>

          {/* Thinking Process - Always visible once we have thinking text */}
          {thinkingText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ marginBottom: '12px' }}
            >
              <Collapse
                size="small"
                style={{
                  background: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(255, 215, 0, 0.1)',
                  border: 'none',
                  borderRadius: '8px'
                }}
                items={[
                  {
                    key: 'thinking',
                    label: (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '500',
                        color: isDark ? '#FFD700' : '#B8860B'
                      }}>
                        <BulbOutlined />
                        Suy nghĩ của AI
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
                        {thinkingText}
                      </div>
                    )
                  }
                ]}
              />
            </motion.div>
          )}

          {/* Search Queries */}
          <AnimatePresence>
            {searchQueries.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ marginBottom: '12px' }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: '12px',
                    marginBottom: '8px',
                    display: 'block'
                  }}
                >
                  Đang tìm kiếm:
                </Text>
                <Space wrap>
                  {searchQueries.map((q, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Tag
                        color="blue"
                        icon={<SearchOutlined />}
                        style={{
                          borderRadius: '12px',
                          fontSize: '12px',
                          padding: '4px 8px'
                        }}
                      >
                        {q.replace('🔍 Đang tìm kiếm: ', '')}
                      </Tag>
                    </motion.div>
                  ))}
                </Space>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Streaming Content */}
          {displayedContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: isDark ? 'rgba(31, 41, 55, 0.5)' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)'}`,
                borderRadius: '12px',
                padding: '20px',
                fontSize: '14px',
                lineHeight: '1.7',
                color: isDark ? '#F3F4F6' : '#374151',
                marginBottom: '12px'
              }}
            >
              <div className="markdown-content">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 style={{
                        color: isDark ? '#F3F4F6' : '#111827',
                        fontSize: '24px',
                        fontWeight: '700',
                        marginBottom: '16px',
                        borderBottom: `2px solid ${isDark ? '#6B7280' : '#E5E7EB'}`,
                        paddingBottom: '8px'
                      }}>
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 style={{
                        color: isDark ? '#F3F4F6' : '#1F2937',
                        fontSize: '20px',
                        fontWeight: '600',
                        marginTop: '24px',
                        marginBottom: '12px'
                      }}>
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 style={{
                        color: isDark ? '#F3F4F6' : '#374151',
                        fontSize: '18px',
                        fontWeight: '600',
                        marginTop: '20px',
                        marginBottom: '10px'
                      }}>
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p style={{
                        marginBottom: '12px',
                        color: isDark ? '#D1D5DB' : '#4B5563'
                      }}>
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul style={{
                        marginBottom: '12px',
                        paddingLeft: '20px',
                        color: isDark ? '#D1D5DB' : '#4B5563'
                      }}>
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol style={{
                        marginBottom: '12px',
                        paddingLeft: '20px',
                        color: isDark ? '#D1D5DB' : '#4B5563'
                      }}>
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li style={{
                        marginBottom: '4px',
                        lineHeight: '1.6'
                      }}>
                        {children}
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong style={{
                        color: isDark ? '#F9FAFB' : '#111827',
                        fontWeight: '600'
                      }}>
                        {children}
                      </strong>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#6366f1',
                          textDecoration: 'none'
                        }}
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {displayedContent}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}

          {/* Sources */}
          {sources.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: '12px' }}
            >
              <Collapse
                size="small"
                style={{
                  background: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(249, 250, 251, 0.8)',
                  border: 'none',
                  borderRadius: '8px'
                }}
                items={[
                  {
                    key: 'sources',
                    label: (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '500',
                        color: isDark ? '#F3F4F6' : '#374151'
                      }}>
                        <InfoCircleOutlined style={{ color: '#6366f1' }} />
                        Nguồn tham khảo ({sources.length})
                      </div>
                    ),
                    children: (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {sources.map((source, index) => {
                          const domain = source.title.replace('www.', '');
                          const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;

                          return (
                            <a
                              key={index}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                background: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.8)',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <img
                                src={faviconUrl}
                                alt=""
                                style={{ width: 16, height: 16, borderRadius: '4px' }}
                                onError={(e) => {
                                  e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <circle cx="8" cy="8" r="8" fill="${isDark ? '#374151' : '#E5E7EB'}"/>
                                      <text x="8" y="11" text-anchor="middle" fill="${isDark ? '#D1D5DB' : '#6B7280'}" font-size="8" font-family="Arial">W</text>
                                    </svg>
                                  `)}`;
                                }}
                              />
                              <span style={{
                                fontSize: '13px',
                                color: isDark ? '#D1D5DB' : '#4B5563',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {domain}
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    )
                  }
                ]}
              />
            </motion.div>
          )}

          {/* Completion Message */}
          {currentStep === 'complete' && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                background: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckOutlined style={{ color: '#22c55e', fontSize: '16px' }} />
              <Text style={{
                color: '#22c55e',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Nghiên cứu hoàn tất!
              </Text>
            </motion.div>
          )}

          {/* Loading Animation */}
          {isProcessing && !displayedContent && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center',
              padding: '12px 0'
            }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#6366f1'
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </motion.div >
  );
};