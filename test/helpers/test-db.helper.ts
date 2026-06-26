/**
 * Test Database Helper
 *
 * HOW THE TEST DB WORKS:
 *
 * We use the `testcontainers` library to spin up a real PostgreSQL container
 * for each test suite. This gives us:
 *
 * 1. Real database behavior (no mocks, no SQLite)
 * 2. Automatic cleanup (container destroyed after tests)
 * 3. Isolation (each suite gets its own container)
 *
 * MIGRATIONS:
 * We use `synchronize: true` in test environment, which auto-creates tables
 * from TypeORM entity metadata. This is faster than running migrations for tests.
 *
 * DATA ISOLATION:
 * Between tests within a suite, we truncate all tables. This ensures each test
 * starts with a clean database without the overhead of container recreation.
 *
 * ALTERNATIVE APPROACHES:
 * - docker-compose test service: manual setup, shared across all tests
 * - transaction rollback: wrap each test in a transaction and rollback
 *   (faster but can mask transaction-related bugs)
 */
import { DataSource } from 'typeorm';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { AdminOrmEntity } from '@infrastructure/database/typeorm/entities/admin.orm-entity';
import { ClientOrmEntity } from '@infrastructure/database/typeorm/entities/client.orm-entity';
import { VehicleOrmEntity } from '@infrastructure/database/typeorm/entities/vehicle.orm-entity';
import { ServiceOrmEntity } from '@infrastructure/database/typeorm/entities/service.orm-entity';
import { ServiceOrderOrmEntity } from '@infrastructure/database/typeorm/entities/service-order.orm-entity';
import { PartOrmEntity } from '@infrastructure/database/typeorm/entities/part.orm-entity';
import { BudgetOrmEntity } from '@infrastructure/database/typeorm/entities/budget.orm-entity';

let container: StartedTestContainer;
let dataSource: DataSource;

export async function setupTestDb(): Promise<DataSource> {
  container = await new GenericContainer('postgres:16-alpine')
    .withEnvironment({
      POSTGRES_DB: 'test_db',
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test',
    })
    .withExposedPorts(5432)
    .start();

  const port = container.getMappedPort(5432);
  const host = container.getHost();

  dataSource = new DataSource({
    type: 'postgres',
    host,
    port,
    username: 'test',
    password: 'test',
    database: 'test_db',
    entities: [
      AdminOrmEntity,
      ClientOrmEntity,
      VehicleOrmEntity,
      ServiceOrmEntity,
      ServiceOrderOrmEntity,
      PartOrmEntity,
      BudgetOrmEntity,
    ],
    synchronize: true,
    logging: false,
  });

  await dataSource.initialize();
  return dataSource;
}

export async function teardownTestDb(): Promise<void> {
  if (dataSource?.isInitialized) {
    await dataSource.destroy();
  }
  if (container) {
    await container.stop();
  }
}

export async function truncateAllTables(ds: DataSource): Promise<void> {
  const entities = ds.entityMetadatas;
  for (const entity of entities) {
    const repository = ds.getRepository(entity.name);
    await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`);
  }
}

export function getTestDataSource(): DataSource {
  return dataSource;
}
