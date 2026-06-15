import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getTypeOrmConfig(): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'soat_repair_shop',
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV !== 'production',
    logging: false,
  };
}
