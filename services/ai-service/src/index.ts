import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

console.log('Starting AI Service...');

// Load environment variables
dotenv.config();

console.log('Environment loaded, importing controllers...');

// Global Error Handlers to prevent crash
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
  // Do not exit, keep running if possible
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
});

import { sendMessage, getQuickActions, executeQuickAction, classifyIntentHandler } from './controllers/chat.controller';
import { webSearch, webSearchStream } from './controllers/web-search.controller';
import { deepResearch, deepResearchStream } from './controllers/deep-research.controller';
import { generateLoginQR, getLoginStatus, getAccountInfo, disconnectAccount, autoRestoreSession, healthCheck as zaloHealthCheck, sendMessage as zaloSendMessage, startListener, stopListener, getConversations } from './controllers/zalo.controller';
import bookingRAGController from './controllers/booking-rag.controller';
import bookingWebhookController from './controllers/booking-webhook.controller';

console.log('Controllers imported successfully');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined', {
  skip: (req, res) => {
    return req.url.includes('/login-status') || req.url.includes('/health');
  }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'AI Service',
    timestamp: new Date().toISOString()
  });
});

// Chat routes
app.post('/api/v1/chat/send', sendMessage);
app.post('/api/v1/chat/classify', classifyIntentHandler);
app.get('/api/v1/chat/quick-actions', getQuickActions);
app.post('/api/v1/chat/quick-actions/execute', executeQuickAction);

// Web Search routes
app.post('/api/v1/web-search', webSearch);
app.post('/api/v1/web-search/stream', webSearchStream);

// Deep Research routes
app.post('/api/v1/deep-research', deepResearch);
app.post('/api/v1/deep-research/stream', deepResearchStream);

// Zalo Integration routes
app.post('/api/v1/zalo/login-qr', generateLoginQR);
app.get('/api/v1/zalo/login-status/:accountId', getLoginStatus);
app.get('/api/v1/zalo/account-info/:accountId', getAccountInfo);
app.get('/api/v1/zalo/auto-restore/:accountId', autoRestoreSession);
app.get('/api/v1/zalo/conversations/:accountId', getConversations);
app.delete('/api/v1/zalo/account/:accountId', disconnectAccount);
app.post('/api/v1/zalo/send-message', zaloSendMessage);
app.post('/api/v1/zalo/start-listener', startListener);
app.post('/api/v1/zalo/stop-listener', stopListener);
app.get('/api/v1/zalo/health', zaloHealthCheck);

// Booking RAG routes (NEW)
app.use('/api/booking', bookingRAGController);
app.use('/api/booking', bookingWebhookController); // Webhook for Zalo hotel replies

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
console.log('Attempting to start server on port:', PORT);

app.listen(PORT, () => {
  console.log(`🚀 AI Service running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Environment: ${process.env.NODE_ENV || 'development'}`);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
});