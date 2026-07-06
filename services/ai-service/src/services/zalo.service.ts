import { Injectable } from '@nestjs/common'; // Assuming we are not using NestJS here but manual class?
// Actually this project uses Express/manual instantiation based on other files.
// So I will just make a class export.

import { Zalo, LoginQRCallbackEventType, ThreadType } from 'zalo-api-final';
import fs from 'fs';
import path from 'path';

export class ZaloService {
    private zaloInstances = new Map<string, any>();
    private loginSessions = new Map<string, any>();

    constructor() { }

    // Helper function to get credentials file path
    private getCredentialsPath(accountId: string) {
        return path.join(process.cwd(), 'zalo-credentials', `${accountId}.json`);
    }

    // Helper function to ensure credentials directory exists
    private ensureCredentialsDir() {
        const dir = path.join(process.cwd(), 'zalo-credentials');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    // Helper function to get or create Zalo instance
    async getZaloInstance(accountId: string, skipAutoLogin = false) {
        if (!this.zaloInstances.has(accountId)) {
            const zalo = new Zalo({
                logging: false,
                selfListen: false,
                checkUpdate: false
            });
            this.zaloInstances.set(accountId, zalo);

            // Try to auto-login from credentials if exists (skip for QR login)
            if (!skipAutoLogin) {
                const credPath = this.getCredentialsPath(accountId);
                if (fs.existsSync(credPath)) {
                    try {
                        const data = JSON.parse(fs.readFileSync(credPath, 'utf8'));
                        const api = await zalo.login(data);
                        // @ts-ignore
                        zalo.api = api;
                        console.log(`✅ Auto-login successful for ${accountId}`);
                    } catch (error) {
                        console.log(`⚠️ Auto-login failed for ${accountId}:`, error);
                    }
                }
            }
        }
        return this.zaloInstances.get(accountId);
    }

    async sendMessage(accountId: string, userId: string | null, groupId: string | null, message: string) {
        const zalo = await this.getZaloInstance(accountId);

        // @ts-ignore
        if (!zalo.api) {
            throw new Error('Not logged in');
        }

        const threadId = userId || groupId;
        if (!threadId) throw new Error('Target required');

        const threadType = groupId ? ThreadType.Group : ThreadType.User;

        // @ts-ignore
        return await zalo.api.sendMessage(message, threadId, threadType);
    }

    // ... (Other refactored methods like loginQR would go here, but for MVP Orchestrator needs sendMessage only)
    // I will leave the login logic in Controller for now to save time, or just expose getInstance?
    // Actually, to make Controller usage clean, I should expose getInstance or move logic.
    // For Orchestrator Phase 4, I just need `sendMessage`.

    // I will export the singleton instance of this service or create new?
    // The controller used global maps. I should keep it singleton.
}

export const zaloService = new ZaloService();
