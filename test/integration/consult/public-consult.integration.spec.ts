/**
 * GAP D — Integration Test Stub: Public Consult Endpoint
 *
 * This test verifies that the public consult endpoint enforces
 * clientId + CPF/CNPJ ownership. A client cannot see another client's OS.
 *
 * // TODO(you): implement this test.
 *
 * Pattern:
 * 1. Seed two clients (client-A with CPF-A, client-B with CPF-B)
 * 2. Create an OS for each client
 * 3. Assert: GET /consult/client-A?cpf=CPF-A → returns client-A's OS
 * 4. Assert: GET /consult/client-A?cpf=CPF-B → returns 403 Forbidden
 * 5. Assert: GET /consult/non-existent?cpf=CPF-A → returns 404
 *
 * You'll need to create the NestJS testing module with Supertest:
 *   const module = await Test.createTestingModule({ imports: [AppModule] })
 *     .overrideProvider(...)  // override DB config for test container
 *     .compile();
 *   const app = module.createNestApplication();
 *   await app.init();
 *   const request = supertest(app.getHttpServer());
 */
import { DataSource } from 'typeorm';
import { setupTestDb, teardownTestDb, truncateAllTables } from '../../helpers/test-db.helper';

describe('Public Consult Endpoint Integration', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await setupTestDb();
  }, 60000);

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await truncateAllTables(dataSource);
  });

  it('should return OS for the correct client when CPF matches', async () => {
    // TODO(you): Arrange — seed client-A + OS-A in the database
    // Act — GET /consult/client-A?cpf=CPF-A
    // Assert — response contains OS-A

    throw new Error(
      'Not implemented: test that a client can see their own OS ' +
        'when providing the correct CPF.',
    );
  });

  it('should return 403 when CPF does not match the client', async () => {
    // TODO(you): Arrange — seed client-A (CPF-A) and client-B (CPF-B)
    // Act — GET /consult/client-A?cpf=CPF-B
    // Assert — 403 Forbidden

    throw new Error(
      'Not implemented: test that a client CANNOT see another client\'s OS.',
    );
  });

  it('should return 404 when client does not exist', async () => {
    // TODO(you): Act — GET /consult/non-existent-id?cpf=any
    // Assert — 404 Not Found

    throw new Error(
      'Not implemented: test that a non-existent client returns 404.',
    );
  });
});
