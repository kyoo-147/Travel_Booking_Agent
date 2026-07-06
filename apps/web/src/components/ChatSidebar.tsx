import React, { useEffect, useRef, useState } from 'react';
import * as motion from 'motion/react-client';
import type { Variants } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';

// Hook để get dimensions
const useDimensions = (ref: React.RefObject<HTMLElement>) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (ref.current) {
      const updateDimensions = () => {
        setDimensions({
          width: ref.current?.offsetWidth || 0,
          height: ref.current?.offsetHeight || 0,
        });
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, [ref]);

  return dimensions;
};

// Animation variants với fixed size để không affect layout
// Simple opacity variants for portal rendering
const simpleVariants = {
  open: {
    opacity: 1,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 200
    }
  },
  closed: {
    opacity: 0,
    transition: {
      type: "spring" as const, 
      damping: 25,
      stiffness: 200
    }
  }
};

// Animation variants for sidebar background
const sidebarVariants = {
  open: () => ({
    clipPath: `circle(450px at calc(100% - 35px) 35px)`,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
    },
  }),
  closed: {
    clipPath: "circle(22px at calc(100% - 35px) 35px)",
    opacity: 0,
    transition: {
      type: "spring" as const, 
      stiffness: 500,
      damping: 40,
    },
  },
};

// Mock data for recent chats
const recentChats = [
  { id: 1, title: 'Plan a trip to Japan', time: '2 hours ago', preview: 'Help me plan a 7-day trip...' },
  { id: 2, title: 'Best hotels in Paris', time: '1 day ago', preview: 'Looking for hotels under $200...' },
  { id: 3, title: 'Flight deals to NYC', time: '3 days ago', preview: 'Find me cheap flights...' },
  { id: 4, title: 'Thailand travel guide', time: '1 week ago', preview: 'What are the must-visit places...' },
  { id: 5, title: 'Europe backpacking', time: '2 weeks ago', preview: 'Planning a month-long trip...' }
];

export const ChatSidebar: React.FC<{ 
  onToggle?: (isOpen: boolean) => void;
  forceClose?: boolean;
}> = ({ onToggle, forceClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark } = useTheme();

  // Notify parent khi sidebar state thay đổi
  useEffect(() => {
    onToggle?.(isOpen);
  }, [isOpen, onToggle]);

  // Force close khi collision detection
  useEffect(() => {
    if (forceClose && isOpen) {
      setIsOpen(false);
    }
  }, [forceClose, isOpen]);

  // Render trực tiếp với fixed positioning tuyệt đối - không animation
  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: '120px',        
        right: '32px',       
        zIndex: 999,
        width: '300px',      
        height: '360px',
        transform: 'none', // Không có transform
        willChange: 'auto', // Không optimize transform
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',      
          height: '100%',
          overflow: 'hidden',
          borderRadius: '16px',
        }}
      >
        {/* Background - conditional rendering thay vì animation */}
        {isOpen && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',      
              height: '100%',     
              background: isDark 
                ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.98), rgba(17, 24, 39, 0.98))'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.98))',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'}`,
              borderRadius: '16px',
              boxShadow: isDark 
                ? '0 16px 32px rgba(0, 0, 0, 0.25)'    
                : '0 16px 32px rgba(0, 0, 0, 0.12)',
            }}
          />
        )}
      </div>
    </div>
  );
};