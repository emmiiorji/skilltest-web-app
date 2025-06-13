import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedAtToTestProfile1749812263194 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE tests_profiles
            ADD COLUMN assignedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        `);


        // Update assignedAt for existing tests_profiles records
        // Set it to the earliest created_at from answers for each test-profile combination or current timestamp if no answers
        await queryRunner.query(`
            UPDATE tests_profiles
            SET assignedAt = COALESCE(test_start_time, CURRENT_TIMESTAMP)
            WHERE assignedAt IS NULL
        `);

        // Set assignedAt to NOT NULL
        await queryRunner.query(`
            ALTER TABLE tests_profiles
            MODIFY COLUMN assignedAt DATETIME NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE tests_profiles
            DROP COLUMN assignedAt
        `);
    }

}
