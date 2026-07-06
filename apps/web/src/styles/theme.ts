export const modernTheme = {
  token: {
    // Primary Colors - Modern Blue/Purple gradient
    colorPrimary: '#6366f1', // Indigo
    colorSuccess: '#10b981', // Emerald
    colorWarning: '#f59e0b', // Amber
    colorError: '#ef4444', // Red
    colorInfo: '#3b82f6', // Blue
    
    // Background Colors
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8fafc', // Slate-50
    colorBgElevated: '#ffffff',
    
    // Border & Radius
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusOuter: 8,
    borderRadiusSM: 8,
    borderRadiusXS: 6,
    
    // Typography
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 20,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    fontWeightStrong: 600,
    lineHeight: 1.5,
    lineHeightLG: 1.5,
    lineHeightSM: 1.5,
    
    // Spacing
    padding: 16,
    paddingXS: 8,
    paddingSM: 12,
    paddingLG: 24,
    paddingXL: 32,
    
    // Box Shadow
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    boxShadowTertiary: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    
    // Motion
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionEaseOut: 'cubic-bezier(0, 0, 0.2, 1)',
    motionEaseIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#ffffff',
      bodyBg: '#f8fafc',
      headerHeight: 64,
      headerPadding: '0 24px',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(99, 102, 241, 0.1)',
      itemSelectedColor: '#6366f1',
      itemHoverBg: 'rgba(99, 102, 241, 0.05)',
      itemHoverColor: '#6366f1',
      iconSize: 18,
      fontSize: 14,
      itemHeight: 48,
      horizontalItemSelectedColor: '#6366f1',
      horizontalItemSelectedBg: 'rgba(99, 102, 241, 0.1)',
    },
    Button: {
      primaryShadow: 'none',
      defaultShadow: 'none',
      borderRadius: 8,
      controlHeight: 40,
      controlHeightSM: 32,
      controlHeightLG: 48,
      paddingInline: 16,
      paddingInlineLG: 24,
      fontWeight: 500,
    },
    Card: {
      borderRadiusLG: 16,
      paddingLG: 24,
      headerBg: 'transparent',
    },
    Table: {
      borderRadius: 12,
      headerBg: '#f8fafc',
      headerColor: '#374151',
      rowHoverBg: '#f8fafc',
    },
    Form: {
      labelFontSize: 14,
      labelColor: '#374151',
      itemMarginBottom: 20,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      paddingInline: 12,
      fontSize: 14,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
      fontSize: 14,
    },
    DatePicker: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Modal: {
      borderRadiusLG: 16,
      paddingLG: 24,
    },
    Notification: {
      borderRadiusLG: 12,
    },
    Message: {
      borderRadiusLG: 8,
    },
  },
  cssVar: true,
  hashed: false,
};

export const darkTheme = {
  ...modernTheme,
  token: {
    ...modernTheme.token,
    colorBgBase: '#0f172a', // Slate-900
    colorBgContainer: '#1e293b', // Slate-800
    colorBgLayout: '#020617', // Slate-950
    colorBgElevated: '#1e293b', // Slate-800
    colorText: '#f1f5f9', // Slate-100
    colorTextSecondary: '#cbd5e1', // Slate-300
    colorTextTertiary: '#94a3b8', // Slate-400
    colorBorder: '#334155', // Slate-700
    colorBorderSecondary: '#475569', // Slate-600
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    fontWeightStrong: 600,
    lineHeight: 1.5,
    lineHeightLG: 1.5,
    lineHeightSM: 1.5,
  },
  components: {
    ...modernTheme.components,
    Layout: {
      ...modernTheme.components.Layout,
      headerBg: '#1e293b',
      siderBg: '#1e293b',
      bodyBg: '#020617',
    },
    Table: {
      ...modernTheme.components.Table,
      headerBg: '#334155',
      headerColor: '#f1f5f9',
      rowHoverBg: '#334155',
    },
  },
};