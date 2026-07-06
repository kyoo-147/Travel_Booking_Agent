-- Initialize travel agent database
CREATE DATABASE travel_agent_dev;
CREATE DATABASE travel_agent_test;

-- Create extensions
\c travel_agent_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c travel_agent_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";