/**
 * GAP D — Integration Test Stub: Re-Budget Flow
 *
 * This test verifies the complete re-budget flow end-to-end:
 * 1. Create OS → move to EM_EXECUCAO (with approved budget v1)
 * 2. Trigger re-budget: EM_EXECUCAO → AGUARDANDO_APROVACAO
 * 3. Create new budget v2 with different prices
 * 4. Approve budget v2
 * 5. Move back to EM_EXECUCAO
 * 6. Verify: both budget versions exist in DB, OS has correct history
 *
 * // TODO(you): implement this test.
 *
 * This is the most complex integration test because it involves
 * multiple aggregates (ServiceOrder + Budget) and their interaction.
 * It verifies:
 * - Budget versioning works correctly
 * - OS status transitions work with re-budget
 * - Price freezing is maintained per version
 * - History records all transitions including the re-budget
 */
import { DataSource } from 'typeorm';
import { setupTestDb, teardownTestDb, truncateAllTables } from '../../helpers/test-db.helper';

describe('Re-Budget Flow Integration', () => {
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

  it('should complete the full re-budget flow: execução → new budget → aguardando → execução', async () => {
    // TODO(you): Arrange
    // 1. Create a Part (e.g., "Filtro", price 50.0, stock 10)
    // 2. Create a Client
    // 3. Create a ServiceOrder for the client
    // 4. Transition OS: RECEBIDA → EM_DIAGNOSTICO → AGUARDANDO_APROVACAO
    // 5. Create Budget v1 with the part at frozenPrice 50.0
    // 6. Approve Budget v1
    // 7. Set budget on OS, transition to EM_EXECUCAO
    //
    // Act — Re-budget flow:
    // 8. Transition OS: EM_EXECUCAO → AGUARDANDO_APROVACAO (re-budget)
    // 9. Change the catalog part price to 75.0 (simulates price change)
    // 10. Create Budget v2 with the part at frozenPrice 75.0
    // 11. Approve Budget v2
    // 12. Set new budget on OS, transition back to EM_EXECUCAO
    //
    // Assert:
    // - OS is in EM_EXECUCAO
    // - OS budgetId points to v2
    // - Budget v1 exists with total = 50.0, version = 1
    // - Budget v2 exists with total = 75.0, version = 2
    // - OS history has all transitions including re-budget path
    // - Catalog part price is 75.0 but budget v1 total is still 50.0 (frozen!)

    throw new Error(
      'Not implemented: test the full re-budget lifecycle. ' +
        'This is the most complex integration test — see the comments above.',
    );
  });

  it('should maintain budget v1 total even after catalog price changes', async () => {
    // TODO(you): This is a focused test for price freezing:
    // 1. Create budget with part at price 100.0
    // 2. Change the part catalog price to 200.0
    // 3. Persist and re-read the budget
    // 4. Assert budget total still reflects 100.0

    throw new Error(
      'Not implemented: test price freezing persists across save/load cycles.',
    );
  });
});
