/**
 * Chunk booking context into semantic pieces for better embedding quality
 */

export interface BookingContext {
    userContact?: {
        displayName?: string;
        contactPhone?: string;
        contactEmail?: string;
        communicationStyle?: string;
        preferredLanguage?: string;
    };
    tripDetails?: {
        destination?: string;
        checkInDate?: string;
        checkOutDate?: string;
        numberOfGuests?: number;
        numberOfRooms?: number;
        urgencyLevel?: string;
        budgetMinPerNight?: number;
        budgetMaxPerNight?: number;
        accommodationType?: string;
        mustHaveAmenities?: Record<string, boolean>;
        preferredAmenities?: Record<string, boolean>;
        note?: string;
    };
}

export interface Chunk {
    text: string;
    chunkType: string;
}

/**
 * Chunk booking context into semantic pieces
 */
export function chunkBookingContext(context: BookingContext): Chunk[] {
    const chunks: Chunk[] = [];

    // User contact info
    if (context.userContact) {
        const { displayName, contactPhone, contactEmail, communicationStyle } = context.userContact;
        if (displayName || contactPhone || contactEmail) {
            chunks.push({
                text: `Thông tin liên hệ: ${displayName || ''}, ${contactPhone || ''}, ${contactEmail || ''}. Phong cách giao tiếp: ${communicationStyle || 'neutral'}`,
                chunkType: 'contact_info'
            });
        }
    }

    // Trip details
    if (context.tripDetails) {
        const trip = context.tripDetails;

        // Destination
        if (trip.destination) {
            chunks.push({
                text: `Điểm đến: ${trip.destination}`,
                chunkType: 'destination'
            });
        }

        // Dates
        if (trip.checkInDate && trip.checkOutDate) {
            chunks.push({
                text: `Ngày ở: ${trip.checkInDate} → ${trip.checkOutDate}`,
                chunkType: 'dates'
            });
        }

        // Guests and rooms
        if (trip.numberOfGuests !== undefined || trip.numberOfRooms !== undefined) {
            chunks.push({
                text: `Số khách: ${trip.numberOfGuests || '?'}, Số phòng: ${trip.numberOfRooms || '?'}`,
                chunkType: 'capacity'
            });
        }

        // Budget
        if (trip.budgetMinPerNight !== undefined || trip.budgetMaxPerNight !== undefined) {
            chunks.push({
                text: `Ngân sách: ${trip.budgetMinPerNight?.toLocaleString() || '?'} tới ${trip.budgetMaxPerNight?.toLocaleString() || '?'} VND/đêm`,
                chunkType: 'budget'
            });
        }

        // Accommodation type
        if (trip.accommodationType) {
            chunks.push({
                text: `Loại hình lưu trú: ${trip.accommodationType}`,
                chunkType: 'accommodation_type'
            });
        }

        // Must-have amenities
        if (trip.mustHaveAmenities) {
            const amenities = Object.entries(trip.mustHaveAmenities)
                .filter(([_, v]) => v)
                .map(([k]) => k);
            if (amenities.length > 0) {
                chunks.push({
                    text: `Tiện ích bắt buộc: ${amenities.join(', ')}`,
                    chunkType: 'must_have_amenities'
                });
            }
        }

        // Preferred amenities
        if (trip.preferredAmenities) {
            const amenities = Object.entries(trip.preferredAmenities)
                .filter(([_, v]) => v)
                .map(([k]) => k);
            if (amenities.length > 0) {
                chunks.push({
                    text: `Tiện ích ưu tiên: ${amenities.join(', ')}`,
                    chunkType: 'preferred_amenities'
                });
            }
        }

        // Urgency
        if (trip.urgencyLevel) {
            chunks.push({
                text: `Mức độ gấp: ${trip.urgencyLevel}`,
                chunkType: 'urgency'
            });
        }

        // Note
        if (trip.note) {
            chunks.push({
                text: `Ghi chú: ${trip.note}`,
                chunkType: 'note'
            });
        }
    }

    console.log(`[Chunker] Created ${chunks.length} chunks from context`);
    return chunks;
}
