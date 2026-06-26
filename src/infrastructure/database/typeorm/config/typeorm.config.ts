import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export function getTypeOrmConfig(): TypeOrmModuleOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'soat_repair_shop',
    autoLoadEntities: true,
    // Em dev/test usamos synchronize para agilidade. Em producao o schema e
    // criado/migrado pelas migrations (rodadas automaticamente no boot), nunca
    // por synchronize.
    synchronize: !isProduction,
    migrations: [join(__dirname, '..', 'migrations', '*.{js,ts}')],
    migrationsRun: isProduction,
    logging: false,
  };
}
