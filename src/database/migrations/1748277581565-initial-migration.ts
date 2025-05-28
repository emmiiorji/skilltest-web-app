import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1748277581565 implements MigrationInterface {
    name = 'InitialMigration1748277581565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Find the actual index name for the unique constraint on the link column
        const existingIndexes = await queryRunner.query(`
            SELECT index_name, column_name, non_unique
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
            AND table_name = 'profile'
            AND column_name = 'link'
            AND non_unique = 0
        `);

        // Drop the existing unique index on link column if it exists
        if (existingIndexes.length > 0 && existingIndexes[0].INDEX_NAME) {
            const indexName = existingIndexes[0].INDEX_NAME;
            console.log(`Dropping existing index: ${indexName}`);
            await queryRunner.query(`DROP INDEX \`${indexName}\` ON \`profile\``);
        } else {
            console.log('No unique index found on profile.link column - skipping drop operation');
        }

        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`focus_lost_events\` \`focus_lost_events\` json NOT NULL DEFAULT (JSON_ARRAY())`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`clipboard_events\` \`clipboard_events\` json NOT NULL DEFAULT (JSON_ARRAY())`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`pre_submit_delay\` \`pre_submit_delay\` float NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`answer_change_events\` \`answer_change_events\` json NOT NULL DEFAULT (JSON_ARRAY())`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`device_fingerprint\` \`device_fingerprint\` json NOT NULL DEFAULT (JSON_OBJECT())`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`device_type\` \`device_type\` varchar(10) NOT NULL DEFAULT 'desktop'`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`time_to_first_interaction\` \`time_to_first_interaction\` float NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`mouse_click_events\` \`mouse_click_events\` json NOT NULL DEFAULT (JSON_ARRAY())`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`keyboard_press_events\` \`keyboard_press_events\` json NOT NULL DEFAULT (JSON_ARRAY())`);
        await queryRunner.query(`ALTER TABLE \`tests\` CHANGE \`tracking_config\` \`tracking_config\` json NOT NULL DEFAULT (JSON_OBJECT())`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tests\` CHANGE \`tracking_config\` \`tracking_config\` json NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`keyboard_press_events\` \`keyboard_press_events\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`mouse_click_events\` \`mouse_click_events\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`time_to_first_interaction\` \`time_to_first_interaction\` float NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`device_type\` \`device_type\` varchar(10) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NULL DEFAULT 'desktop'`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`device_fingerprint\` \`device_fingerprint\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`answer_change_events\` \`answer_change_events\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`pre_submit_delay\` \`pre_submit_delay\` float NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`clipboard_events\` \`clipboard_events\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`answers\` CHANGE \`focus_lost_events\` \`focus_lost_events\` json NULL`);

        // Recreate the index with the TypeORM expected name
        const indexExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
            AND table_name = 'profile'
            AND column_name = 'link'
            AND non_unique = 0
        `);

        if (parseInt(indexExists[0].count) === 0) {
            await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_629be5336319558dc34e55d8ab\` ON \`profile\` (\`link\`)`);
        }
    }

}
