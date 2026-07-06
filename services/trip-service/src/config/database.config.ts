import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as entities from '../entities';

export const createDatabaseConfig = (configService: ConfigService) => {
  return new DataSource({
    type: 'postgres',
    host: configService.get('DATABASE_HOST', 'localhost'),
    port: configService.get('DATABASE_PORT', 5432),
    username: configService.get('DATABASE_USERNAME', 'postgres'),
    password: configService.get('DATABASE_PASSWORD', 'postgres'),
    database: configService.get('DATABASE_NAME', 'travel_agent_dev'),
    entities: Object.values(entities).filter(entity => typeof entity === 'function'),
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: configService.get('NODE_ENV') === 'development',
    logging: configService.get('NODE_ENV') === 'development',
    ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  });
};

// For TypeORM CLI
const config = new ConfigService();
export default createDatabaseConfig(config);