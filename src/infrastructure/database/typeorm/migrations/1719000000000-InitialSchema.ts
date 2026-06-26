import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration inicial — cria todo o schema da oficina.
 *
 * Reflete exatamente o metadata das ORM entities (mesmas tabelas/colunas que o
 * `synchronize: true` geraria em dev/test). Em producao o app roda esta migration
 * automaticamente no boot (`migrationsRun: true`), garantindo que o
 * `docker-compose up` suba com o schema pronto.
 */
export class InitialSchema1719000000000 implements MigrationInterface {
  name = 'InitialSchema1719000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "admins" (
        "id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "email" character varying(255) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_admins_email" UNIQUE ("email"),
        CONSTRAINT "PK_admins_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "cpf_cnpj" character varying(14) NOT NULL,
        "email" character varying(255),
        "phone" character varying(20),
        "vehicle_ids" jsonb NOT NULL DEFAULT '[]',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_clients_cpf_cnpj" UNIQUE ("cpf_cnpj"),
        CONSTRAINT "PK_clients_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "vehicles" (
        "id" uuid NOT NULL,
        "plate" character varying(10) NOT NULL,
        "brand" character varying(100) NOT NULL,
        "model" character varying(100) NOT NULL,
        "year" integer NOT NULL,
        "owner_client_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_vehicles_plate" UNIQUE ("plate"),
        CONSTRAINT "PK_vehicles_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "services" (
        "id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "base_price" numeric(10,2) NOT NULL,
        "estimated_minutes" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_services_name" UNIQUE ("name"),
        CONSTRAINT "PK_services_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "parts" (
        "id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "sku" character varying(50) NOT NULL,
        "unit_price" numeric(10,2) NOT NULL,
        "stock_quantity" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_parts_sku" UNIQUE ("sku"),
        CONSTRAINT "PK_parts_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "service_orders" (
        "id" uuid NOT NULL,
        "client_id" uuid NOT NULL,
        "vehicle_id" uuid,
        "description" text NOT NULL,
        "status" character varying(50) NOT NULL,
        "budget_id" uuid,
        "status_history" jsonb NOT NULL DEFAULT '[]',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_service_orders_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "budgets" (
        "id" uuid NOT NULL,
        "service_order_id" uuid NOT NULL,
        "lines" jsonb NOT NULL,
        "status" character varying(20) NOT NULL,
        "version" integer NOT NULL,
        "total" numeric(10,2) NOT NULL,
        "frozen_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_budgets_id" PRIMARY KEY ("id")
      )
    `);

    // Indices auxiliares para os principais acessos por chave estrangeira logica.
    await queryRunner.query(
      `CREATE INDEX "IDX_vehicles_owner_client_id" ON "vehicles" ("owner_client_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_service_orders_client_id" ON "service_orders" ("client_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_service_orders_status" ON "service_orders" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_budgets_service_order_id" ON "budgets" ("service_order_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_budgets_service_order_id"`);
    await queryRunner.query(`DROP INDEX "IDX_service_orders_status"`);
    await queryRunner.query(`DROP INDEX "IDX_service_orders_client_id"`);
    await queryRunner.query(`DROP INDEX "IDX_vehicles_owner_client_id"`);
    await queryRunner.query(`DROP TABLE "budgets"`);
    await queryRunner.query(`DROP TABLE "service_orders"`);
    await queryRunner.query(`DROP TABLE "parts"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TABLE "vehicles"`);
    await queryRunner.query(`DROP TABLE "clients"`);
    await queryRunner.query(`DROP TABLE "admins"`);
  }
}
