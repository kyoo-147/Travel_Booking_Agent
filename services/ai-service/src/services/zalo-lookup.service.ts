import { getZaloInstance } from '../controllers/zalo.controller';

export interface ZaloContactInfo {
    phone: string;
    uid: string;
    displayName: string;
    avatar?: string;
    lastUpdated: Date;
}

// In-memory cache for MVP (replace with DB in production)
const contactCache = new Map<string, ZaloContactInfo>();

/**
 * Find Zalo user by phone number
 * Uses zalo-api-final's findUser method
 */
export async function findZaloUserByPhone(
    accountId: string,
    phoneNumber: string
): Promise<ZaloContactInfo | null> {
    try {
        // Check cache first
        const cached = contactCache.get(phoneNumber);
        if (cached) {
            console.log(`[ZaloLookup] ✅ Found cached contact for ${phoneNumber}`);
            return cached;
        }

        console.log(`[ZaloLookup] 🔍 Looking up Zalo user for phone: ${phoneNumber}`);

        // Get Zalo API instance
        const zalo = await getZaloInstance(accountId);
        if (!(zalo as any).api) {
            throw new Error('Zalo not logged in');
        }

        const api = (zalo as any).api;

        // Call findUser API
        const userInfo = await api.findUser(phoneNumber);

        if (!userInfo || !userInfo.uid) {
            console.warn(`[ZaloLookup] ⚠️ No Zalo user found for ${phoneNumber}`);
            return null;
        }

        // Cache the result
        const contactInfo: ZaloContactInfo = {
            phone: phoneNumber,
            uid: userInfo.uid,
            displayName: userInfo.display_name || userInfo.zalo_name || phoneNumber,
            avatar: userInfo.avatar,
            lastUpdated: new Date()
        };

        contactCache.set(phoneNumber, contactInfo);
        console.log(`[ZaloLookup] ✅ Found Zalo user: ${contactInfo.displayName} (${contactInfo.uid})`);

        return contactInfo;
    } catch (error: any) {
        console.error(`[ZaloLookup] ❌ Error looking up ${phoneNumber}:`, error.message);
        return null;
    }
}

/**
 * Get cached contact info without API call
 */
export function getCachedContact(phoneNumber: string): ZaloContactInfo | null {
    return contactCache.get(phoneNumber) || null;
}

/**
 * Manually add contact to cache (for testing or manual entry)
 */
export function cacheContact(contactInfo: ZaloContactInfo): void {
    contactCache.set(contactInfo.phone, contactInfo);
    console.log(`[ZaloLookup] 📝 Cached contact: ${contactInfo.phone} → ${contactInfo.uid}`);
}
