-- Fix BookingConversation Migration Issue
-- This script drops and recreates the booking_conversations table

-- 1. Drop the old table completely (will lose old data - OK for dev)
DROP TABLE IF EXISTS "booking_conversations" CASCADE;

-- 2. The table will be auto-created by TypeORM on next start
-- with the correct new schema

-- Optional: If you want to verify tables after restart
-- SELECT table_name, column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'booking_conversations'
-- ORDER BY ordinal_position;
