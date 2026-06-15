/**
 * GAP D — Integration Test Stub: Stock Concurrency
 *
 * This test verifies that concurrent stock decrements NEVER result in
 * negative stock. This requires proper database-level locking.
 *
 * The test should:
 * 1. Create a part with stockQuantity = 5
 * 2. Fire 10 concurrent requests to decrement by 1
 * 3. Assert that exactly 5 succeed and 5 fail
 * 4. Assert that the final stock is 0 (never negative)
 *
 * // TODO(you): implement this test.
 * Hints:
 * - Use Promise.allSettled() to fire concurrent operations
 * - You may need to implement optimistic locking (version column)
 *   or pessimistic locking (SELECT FOR UPDATE) in the repository
 * - The test proves your locking strategy works
 */
import { DataSource } from 'typeorm';
import { setupTestDb, teardownTestDb, truncateAllTables } from '../../helpers/test-db.helper';

describe('Stock Concurrency Integration', () => {
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

  it('should never allow stock to go negative under concurrent decrements', async () => {
    // TODO(you): Arrange — create a Part with stockQuantity = 5
    //
    // Act — fire 10 concurrent decrementStock(1) calls using Promise.allSettled
    //
    // Assert:
    //   - Exactly 5 promises resolved (succeeded)
    //   - Exactly 5 promises rejected (insufficient stock)
    //   - Final stock in DB is 0
    //   - Stock is NEVER negative at any point
    //
    // This test validates your concurrency control strategy.
    // Consider using optimistic locking (@VersionColumn) or
    // pessimistic locking (SELECT ... FOR UPDATE) in TypeORM.

    throw new Error(
      'Not implemented: test concurrent stock decrements. ' +
        'See the comment above for the arrange/act/assert pattern.',
    );
  });
});
