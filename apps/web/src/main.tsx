import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'
import { loadFonts, preloadInterFont } from './utils/fontUtils.ts'
import './i18n' // Initialize i18n
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/vi';

// Configure Dayjs global settings
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

// Initialize font loading
preloadInterFont();
loadFonts();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)