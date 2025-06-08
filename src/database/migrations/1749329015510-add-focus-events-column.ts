import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFocusEventsColumn1749329015510 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add focus_events column to answers table
        await queryRunner.query(`
            ALTER TABLE \`answers\`
            ADD COLUMN \`focus_events\` json NOT NULL DEFAULT (JSON_ARRAY())
        `);

        // Migrate existing focus_lost_events data to focus_events with type "inactive"
        await queryRunner.query(`
            UPDATE \`answers\`
            SET \`focus_events\` = (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'timestamp', JSON_EXTRACT(event.value, '$.timestamp'),
                        'duration_ms', JSON_EXTRACT(event.value, '$.duration_ms'),
                        'type', 'inactive'
                    )
                )
                FROM JSON_TABLE(
                    \`focus_lost_events\`,
                    '$[*]' COLUMNS (
                        value JSON PATH '$'
                    )
                ) AS event
            )
            WHERE JSON_LENGTH(\`focus_lost_events\`) > 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove focus_events column from answers table
        await queryRunner.query(`
            ALTER TABLE \`answers\`
            DROP COLUMN \`focus_events\`
        `);
    }


}
