import { Request, Response } from 'express';
import { Zalo, LoginQRCallbackEventType, ThreadType } from 'zalo-api-final';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Store active Zalo instances by accountId
const zaloInstances = new Map<string, any>();
const loginSessions = new Map<string, any>();

// Helper function to get credentials file path
const getCredentialsPath = (accountId: string) => {
  return path.join(process.cwd(), 'zalo-credentials', `${accountId}.json`);
};

// Helper function to ensure credentials directory exists
const ensureCredentialsDir = () => {
  const dir = path.join(process.cwd(), 'zalo-credentials');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Helper function to get or create Zalo instance
export const getZaloInstance = async (accountId: string, skipAutoLogin = false) => {
  if (!zaloInstances.has(accountId)) {
    const zalo = new Zalo({
      logging: false,
      selfListen: false,
      checkUpdate: false
    });
    zaloInstances.set(accountId, zalo);

    // Try to auto-login from credentials if exists (skip for QR login)
    if (!skipAutoLogin) {
      const credPath = getCredentialsPath(accountId);
      if (fs.existsSync(credPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(credPath, 'utf8'));
          const api = await zalo.login(data);
          (zalo as any).api = api;
          console.log(`✅ Auto-login successful for ${accountId}`);
        } catch (error) {
          console.log(`⚠️ Auto-login failed for ${accountId}:`, error);
        }
      }
    }
  }
  return zaloInstances.get(accountId);
};

/**
 * POST /api/v1/zalo/login-qr
 * Generate QR code for Zalo login
 */
export const generateLoginQR = async (req: Request, res: Response) => {
  try {
    const { accountId = 'default' } = req.body;

    console.log(`🔑 Generating QR for account: ${accountId}`);

    // Get Zalo instance (skip auto-login for QR flow)
    const zalo = await getZaloInstance(accountId, true);

    // Initialize login session
    loginSessions.set(accountId, {
      status: 'pending',
      qrCode: null,
      error: null,
      accountInfo: null,
      timestamp: Date.now()
    });

    // Setup QR login with callback (matching reference implementation)
    // Non-blocking call
    console.log(`[${accountId}] 🚀 Starting QR login...`);

    zalo.loginQR({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      language: "vi"
    }, async (event: any) => {
      console.log(`[${accountId}] QR Event:`, event.type);
      const session = loginSessions.get(accountId);
      if (!session) return;

      switch (event.type) {
        case LoginQRCallbackEventType.QRCodeGenerated:
          console.log(`[${accountId}] ✅ QR Generated`);
          loginSessions.set(accountId, {
            ...session,
            status: 'ready',
            qrCode: event.data.image, // Base64 image
            error: null
          });
          break;

        case LoginQRCallbackEventType.QRCodeScanned:
          console.log(`[${accountId}] 📱 QR Scanned by:`, event.data.display_name);
          loginSessions.set(accountId, {
            ...session,
            status: 'scanning',
            userName: event.data.display_name,
            error: null
          });
          break;

        case LoginQRCallbackEventType.QRCodeExpired:
          console.log(`[${accountId}] ⏰ QR Expired`);
          loginSessions.set(accountId, {
            ...session,
            status: 'expired',
            error: 'QR code đã hết hạn. Vui lòng thử lại.'
          });
          break;

        case LoginQRCallbackEventType.QRCodeDeclined:
          console.log(`[${accountId}] ❌ QR Declined`);
          loginSessions.set(accountId, {
            ...session,
            status: 'error',
            error: 'Người dùng đã từ chối đăng nhập'
          });
          break;

        case LoginQRCallbackEventType.GotLoginInfo:
          console.log(`[${accountId}] ✅ Got Login Info`);

          // Save credentials immediately like reference
          ensureCredentialsDir();
          const credentialsPath = getCredentialsPath(accountId);
          fs.writeFileSync(credentialsPath, JSON.stringify(event.data, null, 2));

          // Login with credentials
          try {
            const api = await zalo.login(event.data);
            console.log(`[${accountId}] ✅ Zalo instance logged in successfully`);

            if (!api) {
              console.error(`[${accountId}] ❌ Login returned null/undefined API`);
              loginSessions.set(accountId, {
                ...session,
                status: 'error',
                error: 'API initialization failed. Please try again.'
              });
              break;
            }

            // Store API in zalo instance
            (zalo as any).api = api;
            console.log(`[${accountId}] ✅ API stored in zalo.api`);

            loginSessions.set(accountId, {
              ...session,
              status: 'success',
              accountInfo: {
                name: session.userName || event.data.display_name || 'Zalo User',
                id: event.data.uid || 'unknown'
              },
              error: null
            });

            // Start listener automatically
            internalStartListener(accountId).catch(err => console.error(`[${accountId}] Failed to start listener:`, err));

          } catch (loginError) {
            console.error(`[${accountId}] ❌ Failed to login Zalo instance:`, loginError);
            loginSessions.set(accountId, {
              ...session,
              status: 'error',
              error: 'Failed to initialize session: ' + (loginError as Error).message
            });
          }
          break;
      }
    }).catch((error: any) => {
      console.error(`[${accountId}] ❌ Login error:`, error);
      const session = loginSessions.get(accountId);
      if (session) {
        let errorMessage = 'Lỗi không xác định';
        if (error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT') {
          errorMessage = 'Không thể kết nối tới server Zalo. Vui lòng kiểm tra kết nối mạng và thử lại.';
        } else {
          errorMessage = error.message || errorMessage;
        }

        loginSessions.set(accountId, {
          ...session,
          status: 'error',
          error: errorMessage
        });
      }
    });

    res.json({
      success: true,
      message: 'QR login session started. Poll /api/zalo/login-status/:accountId for updates.',
      accountId
    });

  } catch (error) {
    console.error('❌ QR generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/v1/zalo/login-status/:accountId
 * Get current login status and QR code
 */
export const getLoginStatus = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const session = loginSessions.get(accountId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Check for timeout (5 minutes)
    if (Date.now() - session.timestamp > 5 * 60 * 1000) {
      loginSessions.delete(accountId);
      return res.json({
        success: true,
        session: {
          status: 'expired',
          error: 'Session timeout'
        }
      });
    }

    res.json({
      success: true,
      session: {
        status: session.status,
        qrCode: session.qrCode,
        error: session.error,
        accountInfo: session.accountInfo
      }
    });

  } catch (error) {
    console.error('❌ Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get login status'
    });
  }
};

/**
 * GET /api/v1/zalo/account-info/:accountId
 * Get detailed account information for connected Zalo account
 */
export const getAccountInfo = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const credentialsPath = getCredentialsPath(accountId);

    if (!fs.existsSync(credentialsPath)) {
      return res.status(404).json({
        success: false,
        error: 'Account not connected'
      });
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

    // Get Zalo instance with auto-login
    const zalo = await getZaloInstance(accountId);

    // Auto-restore listener if not active (Self-healing)
    if (!(zalo as any).api) {
      console.log(`[${accountId}] 🔄 Session found but not active, restoring listener...`);
      try {
        await internalStartListener(accountId);
      } catch (restoreError) {
        console.error(`[${accountId}] ⚠️ Failed to auto-restore listener:`, restoreError);
      }
    }

    // Get detailed info from credentials and session
    const session = loginSessions.get(accountId);
    let detailedInfo = {
      hasProfile: true,
      profile: {
        displayName: credentials.display_name || session?.accountInfo?.name || 'Zalo User',
        uid: credentials.uid || 'unknown'
      }
    };

    // Get session info if available
    // const session = loginSessions.get(accountId); // Removed redundant declaration
    const sessionInfo = session?.accountInfo;

    res.json({
      success: true,
      accountInfo: {
        name: sessionInfo?.name || credentials.display_name || 'Zalo User',
        id: credentials.uid || 'unknown',
        loginTime: new Date(credentials.timestamp || Date.now()).toISOString(),
        imei: credentials.imei,
        userAgent: credentials.userAgent,
        ...detailedInfo
      },
      connected: true,
      rawCredentials: {
        hasImei: !!credentials.imei,
        hasCookie: !!credentials.cookie,
        cookieCount: credentials.cookie?.length || 0,
        loginTimestamp: credentials.timestamp
      }
    });

  } catch (error) {
    console.error('❌ Account info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get account info'
    });
  }
};

/**
 * DELETE /api/v1/zalo/account/:accountId
 * Disconnect Zalo account
 */
export const disconnectAccount = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;

    // Remove from memory
    zaloInstances.delete(accountId);
    loginSessions.delete(accountId);

    // Remove credentials file
    const credentialsPath = getCredentialsPath(accountId);
    if (fs.existsSync(credentialsPath)) {
      fs.unlinkSync(credentialsPath);
    }

    res.json({
      success: true,
      message: 'Account disconnected successfully'
    });

  } catch (error) {
    console.error('❌ Disconnect error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect account'
    });
  }
};

/**
 * GET /api/v1/zalo/conversations/:accountId
 * Get list of conversations (friends + groups)
 */
export const getConversations = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    console.log(`[${accountId}] 📋 Getting conversations...`);

    const zalo = await getZaloInstance(accountId);

    if (!(zalo as any).api) {
      const credentialsPath = getCredentialsPath(accountId);
      const hasCredentials = fs.existsSync(credentialsPath);

      return res.status(401).json({
        error: 'Not logged in. Please scan QR code to login first.',
        hasCredentials
      });
    }

    const api = (zalo as any).api;
    let friends: any[] = [];
    let groups: any[] = [];

    // Get friends
    try {
      friends = await api.getAllFriends();
      console.log(`[${accountId}] ✅ Got ${friends?.length || 0} friends`);
    } catch (err) {
      console.error(`[${accountId}] getAllFriends error:`, (err as Error).message);
    }

    // Get groups
    try {
      const groupsResult = await api.getAllGroups();

      if (groupsResult && groupsResult.gridVerMap) {
        const groupIds = Object.keys(groupsResult.gridVerMap);
        console.log(`[${accountId}] 🔍 Found ${groupIds.length} group IDs`);

        if (groupIds.length > 0) {
          // Chunk IDs to avoid invalid parameter error (limit likely 50 or 100)
          // Fetch group info individually in parallel chunks to avoid "Invalid Parameter" with arrays
          const chunkSize = 10;
          for (let i = 0; i < groupIds.length; i += chunkSize) {
            const chunk = groupIds.slice(i, i + chunkSize);

            await Promise.all(chunk.map(async (groupId) => {
              try {
                // Fetch SINGLE group info (safer than array)
                const groupInfoResult = await api.getGroupInfo(groupId);

                if (groupInfoResult && groupInfoResult.gridInfoMap && groupInfoResult.gridInfoMap[groupId]) {
                  const groupData = groupInfoResult.gridInfoMap[groupId];
                  groups.push({
                    groupId: groupId,
                    groupName: groupData.name || `Group ${groupId.substring(0, 8)}...`,
                    avatar: groupData.fullAvt || groupData.avt
                  });
                } else {
                  // Try to see if valid response but different structure or just empty
                  groups.push({
                    groupId: groupId,
                    groupName: `Group ${groupId.substring(0, 8)}...`,
                    avatar: undefined
                  });
                }
              } catch (err) {
                console.error(`[${accountId}] Failed to get info for group ${groupId}:`, (err as Error).message);
                groups.push({
                  groupId: groupId,
                  groupName: `Group ${groupId.substring(0, 8)}...`,
                  avatar: undefined
                });
              }
            }));

            // Small delay between chunks
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
    } catch (err) {
      console.error(`[${accountId}] getAllGroups error:`, (err as Error).message);
    }

    const conversations = [
      ...(friends || []).map(friend => ({
        id: `zalo_friend_${friend.userId}`,
        accountId,
        title: friend.displayName,
        participants: [{
          id: friend.userId,
          name: friend.displayName,
          avatarUrl: friend.avatar
        }],
        avatarUrl: friend.avatar,
        type: 'friend',
        zaloUserId: friend.userId
      })),
      ...(groups || []).map(group => ({
        id: `zalo_group_${group.groupId}`,
        accountId,
        title: group.groupName,
        participants: [],
        avatarUrl: group.avatar,
        type: 'group',
        zaloGroupId: group.groupId
      }))
    ];

    res.json({
      success: true,
      data: conversations
    });

  } catch (error) {
    console.error('Get Conversations Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/v1/zalo/auto-restore/:accountId
 * Auto-restore Zalo session from saved credentials
 */
export const autoRestoreSession = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const credentialsPath = getCredentialsPath(accountId);

    if (!fs.existsSync(credentialsPath)) {
      return res.json({
        success: false,
        connected: false,
        message: 'No saved session found'
      });
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

    // Check if credentials are still valid (not too old)
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    if (credentials.timestamp && (Date.now() - credentials.timestamp > maxAge)) {
      return res.json({
        success: false,
        connected: false,
        message: 'Session expired'
      });
    }

    try {
      // Try to get Zalo instance with saved credentials
      const zalo = await getZaloInstance(accountId);

      // Check if we have a valid instance (auto-login successful)
      if (!zalo) {
        throw new Error('Failed to get Zalo instance');
      }

      res.json({
        success: true,
        connected: true,
        accountInfo: {
          name: credentials.display_name || 'Zalo User',
          id: credentials.uid || 'unknown'
        },
        message: 'Session restored successfully'
      });

      // Start listener automatically
      internalStartListener(accountId).catch(err => console.error(`[${accountId}] Failed to start listener:`, err));

    } catch (restoreError) {
      console.error(`Session restore failed for ${accountId}:`, (restoreError as Error).message);

      res.json({
        success: false,
        connected: false,
        message: 'Session validation failed',
        error: (restoreError as Error).message
      });
    }

  } catch (error) {
    console.error('❌ Auto-restore error:', error);
    res.status(500).json({
      success: false,
      connected: false,
      error: 'Failed to restore session'
    });
  }
};

/**
 * POST /api/v1/zalo/send-message
 * Send message to a user or group
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { accountId, userId, groupId, message } = req.body;

    if (!accountId || (!userId && !groupId) || !message) {
      return res.status(400).json({
        error: 'accountId, (userId or groupId), and message are required'
      });
    }

    const zalo = await getZaloInstance(accountId);

    // Check if we have an API instance
    if (!(zalo as any).api) {
      return res.status(401).json({
        error: 'Not logged in. Please login first.'
      });
    }

    // Determine thread ID and type
    const threadId = userId || groupId;
    const threadType = groupId ? ThreadType.Group : ThreadType.User;

    console.log(`[${accountId}] 📤 Sending message to ${groupId ? 'group' : 'user'}: ${threadId}`);

    const result = await (zalo as any).api.sendMessage(message, threadId, threadType);

    console.log(`[${accountId}] ✅ Message sent successfully`);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Send Message Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * POST /api/v1/zalo/start-listener
 * Start real-time message listener for an account
 */
// Helper to start listener internally
export const internalStartListener = async (accountId: string, webhookUrl?: string) => {
  // Default webhook to BOOKING service instead of trip service
  const targetUrl = webhookUrl || process.env.BOOKING_WEBHOOK_URL || 'http://localhost:3005/api/booking/webhook/zalo';

  const zalo = await getZaloInstance(accountId);

  // Restore if needed logic (simplified here, check existence)
  if (!(zalo as any).api) {
    const credPath = getCredentialsPath(accountId);
    if (fs.existsSync(credPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(credPath, 'utf8'));
        const api = await zalo.login(data);
        (zalo as any).api = api;
        console.log(`[${accountId}] ✅ API restored for listener`);
      } catch (e) {
        throw new Error('Not logged in. Credentials invalid.');
      }
    } else {
      throw new Error('Not logged in');
    }
  }

  const api = (zalo as any).api;

  if (!api.listener) {
    throw new Error('Listener not available');
  }

  // Cleanup old listeners to avoid duplicates
  api.listener.removeAllListeners('message');
  api.listener.removeAllListeners('error');
  api.listener.removeAllListeners('mqtt_error');

  // Start listener
  try {
    api.listener.start();
    console.log(`[${accountId}] 👂 Listener started, forwarding to: ${targetUrl}`);
  } catch (e) {
    console.log(`[${accountId}] ⚠️ Listener might already be running:`, (e as Error).message);
  }

  // Handle messages - Forward to Booking Webhook
  api.listener.on('message', async (event: any) => {
    try {
      const messageContent = event.data.content || '';
      const senderId = event.data.uidFrom || event.data.idFrom;

      console.log(`[${accountId}] 📨 Hotel message received from ${senderId}`);
      console.log(`[${accountId}] Message: ${messageContent.substring(0, 100)}...`);

      // Forward to Booking Webhook for agent processing
      await axios.post(targetUrl, {
        accountId,
        fromUserId: senderId,
        fromPhone: event.data.phoneNumber || senderId, // May not have phone in event
        message: messageContent,
        timestamp: new Date().toISOString(), // Use current time as ISO string
        rawEvent: event.data // Include full event for debugging
      });

      console.log(`[${accountId}] ✅ Message forwarded to booking webhook`);
    } catch (err) {
      console.error(`[${accountId}] ❌ Webhook delivery failed:`, (err as Error).message);
    }
  });

  api.listener.on('error', (err: any) => console.error(`[${accountId}] Listener Error:`, err));
  api.listener.on('mqtt_error', (err: any) => console.error(`[${accountId}] MQTT Error:`, err));

  return targetUrl;
}

export const startListener = async (req: Request, res: Response) => {
  try {
    const { accountId, webhookUrl } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const forwardingTo = await internalStartListener(accountId, webhookUrl);

    res.json({
      success: true,
      message: 'Listener started',
      forwardingTo
    });

  } catch (error) {
    console.error('❌ Start Listener Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * POST /api/v1/zalo/stop-listener
 * Stop listener
 */
export const stopListener = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.body;
    if (!accountId) return res.status(400).json({ error: 'accountId is required' });

    const zalo = await getZaloInstance(accountId);
    if ((zalo as any).api && (zalo as any).api.listener) {
      (zalo as any).api.listener.stop();
      (zalo as any).api.listener.removeAllListeners();
      console.log(`[${accountId}] 🛑 Listener stopped`);
    }

    res.json({ success: true, message: 'Listener stopped' });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
};

/**
 * GET /api/v1/zalo/health
 * Health check for Zalo integration
 */
export const healthCheck = async (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'Zalo Integration',
    status: 'OK',
    activeInstances: zaloInstances.size,
    activeSessions: loginSessions.size,
    timestamp: new Date().toISOString()
  });
};