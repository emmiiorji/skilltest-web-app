import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTestStartTimeToTestProfiles1748867920782 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add test_start_time column to tests_profiles table
        await queryRunner.query(`
            ALTER TABLE \`tests_profiles\`
            ADD COLUMN \`test_start_time\` datetime NULL
        `);

        // Update test_start_time for existing tests_profiles records
        // Set it to the earliest start_time from answers for each test-profile combination
        await queryRunner.query(`
            UPDATE tests_profiles tp
            SET test_start_time = (
                SELECT MIN(a.start_time)
                FROM answers a
                WHERE a.test_id = tp.testId 
                AND a.profile_id = tp.profileId
                AND a.start_time IS NOT NULL
            )
            WHERE tp.test_start_time IS NULL
            AND EXISTS (
                SELECT 1 
                FROM answers a 
                WHERE a.test_id = tp.testId 
                AND a.profile_id = tp.profileId
                AND a.start_time IS NOT NULL
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove test_start_time column from tests_profiles table
        await queryRunner.query(`
            ALTER TABLE \`tests_profiles\`
            DROP COLUMN \`test_start_time\`
        `);

        // Reset all test_start_time values to NULL
        await queryRunner.query(`
            UPDATE tests_profiles 
            SET test_start_time = NULL
        `);
    }

}
