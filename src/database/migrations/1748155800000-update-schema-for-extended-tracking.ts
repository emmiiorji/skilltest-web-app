import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchemaForExtendedTracking1748155800000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add tracking config to tests (without default value) - only if tests table exists
        const testsTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'tests'
        `);

        const testsTableCount = parseInt(testsTableExists[0].count);
        console.log('Tests table exists:', testsTableCount > 0);

        if (testsTableCount > 0) {
            // Check if tracking_config column already exists
            const trackingConfigExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                AND table_name = 'tests'
                AND column_name = 'tracking_config'
            `);

            const trackingConfigCount = parseInt(trackingConfigExists[0].count);
            console.log('Tracking config column exists:', trackingConfigCount > 0);

            if (trackingConfigCount === 0) {
                console.log('Adding tracking_config column to tests table...');
                await queryRunner.query(`ALTER TABLE tests ADD COLUMN tracking_config JSON NULL`);

                // Set default value for all rows
                console.log('Setting default values for tracking_config...');
                await queryRunner.query(`UPDATE tests SET tracking_config = JSON_OBJECT()`);

                // Make it NOT NULL after setting values
                console.log('Making tracking_config NOT NULL...');
                await queryRunner.query(`ALTER TABLE tests MODIFY COLUMN tracking_config JSON NOT NULL`);
                console.log('Successfully added tracking_config column');
            } else {
                console.log('Tracking config column already exists, skipping...');
            }
        } else {
            console.log('Tests table does not exist, skipping tracking_config addition');
        }

        // 2. Add new columns to answers table - only if answers table exists
        const answersTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'answers'
        `);

        const answersTableCount = parseInt(answersTableExists[0].count);
        if (answersTableCount > 0) {
            const answersColumns = [
                { name: 'focus_lost_events', definition: 'JSON NULL', defaultValue: 'JSON_ARRAY()' },
                { name: 'clipboard_events', definition: 'JSON NULL', defaultValue: 'JSON_ARRAY()' },
                { name: 'pre_submit_delay', definition: 'FLOAT DEFAULT 0' },
                { name: 'answer_change_events', definition: 'JSON NULL', defaultValue: 'JSON_ARRAY()' },
                { name: 'device_fingerprint', definition: 'JSON NULL', defaultValue: 'JSON_OBJECT()' },
                { name: 'device_type', definition: "VARCHAR(10) DEFAULT 'desktop'" },
                { name: 'time_to_first_interaction', definition: 'FLOAT DEFAULT 0' },
                { name: 'mouse_click_events', definition: 'JSON NULL', defaultValue: 'JSON_ARRAY()' },
                { name: 'keyboard_press_events', definition: 'JSON NULL', defaultValue: 'JSON_ARRAY()' }
            ];

            // Add columns to answers table conditionally (sequential for safety)
            for (const column of answersColumns) {
                const columnExists = await queryRunner.query(`
                    SELECT COUNT(*) as count
                    FROM information_schema.columns
                    WHERE table_schema = DATABASE()
                    AND table_name = 'answers'
                    AND column_name = '${column.name}'
                `);

                const columnCount = parseInt(columnExists[0].count);
                if (columnCount === 0) {
                    await queryRunner.query(`ALTER TABLE answers ADD COLUMN ${column.name} ${column.definition}`);

                    // Set default value if specified
                    if (column.defaultValue) {
                        await queryRunner.query(`UPDATE answers SET ${column.name} = ${column.defaultValue}`);
                    }
                }
            }
        }

        // 3. Update tracking config for existing tests - only if tests table and column exist
        if (testsTableCount > 0) {
            const trackingConfigExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                AND table_name = 'tests'
                AND column_name = 'tracking_config'
            `);

            const trackingConfigExistsCount = parseInt(trackingConfigExists[0].count);
            if (trackingConfigExistsCount > 0) {
                // Check if test records exist before updating them
                const testRecordsExist = await queryRunner.query(`
                    SELECT COUNT(*) as count
                    FROM tests
                    WHERE id IN (1, 2)
                `);

                const testRecordsCount = parseInt(testRecordsExist[0].count);
                if (testRecordsCount > 0) {
                    await queryRunner.query(`UPDATE tests SET tracking_config = JSON_OBJECT() WHERE id = 1 AND EXISTS (SELECT 1 FROM tests WHERE id = 1)`);

                    const config = JSON.stringify({
                        disableFocusLostEvents: true,
                        disableMouseClickEvents: true,
                        disableKeyboardPressEvents: true,
                        disableDeviceFingerprint: true
                    });
                    await queryRunner.query(`UPDATE tests SET tracking_config = CAST('${config}' AS JSON) WHERE id = 2 AND EXISTS (SELECT 1 FROM tests WHERE id = 2)`);
                }
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if tests table exists before reverting changes
        const testsTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'tests'
        `);

        const testsTableDownCount = parseInt(testsTableExists[0].count);
        if (testsTableDownCount > 0) {
            // Check if tracking_config column exists before reverting and dropping
            const trackingConfigExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                AND table_name = 'tests'
                AND column_name = 'tracking_config'
            `);

            const trackingConfigDownCount = parseInt(trackingConfigExists[0].count);
            if (trackingConfigDownCount > 0) {
                // Check if test records exist before reverting them
                const testRecordsExist = await queryRunner.query(`
                    SELECT COUNT(*) as count
                    FROM tests
                    WHERE id IN (1, 2)
                `);

                const testRecordsDownCount = parseInt(testRecordsExist[0].count);
                if (testRecordsDownCount > 0) {
                    // Revert test config changes
                    await queryRunner.query(`UPDATE tests SET tracking_config = JSON_OBJECT() WHERE id IN (1, 2)`);
                }

                // Remove the tracking_config column from tests
                await queryRunner.query(`ALTER TABLE tests DROP COLUMN tracking_config`);
            }
        }

        // Check if answers table exists before removing columns
        const answersTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'answers'
        `);

        const answersTableDownCount = parseInt(answersTableExists[0].count);
        if (answersTableDownCount > 0) {
            const columnsToRemove = [
                'focus_lost_events', 'clipboard_events', 'pre_submit_delay',
                'answer_change_events', 'device_fingerprint', 'device_type',
                'time_to_first_interaction', 'mouse_click_events', 'keyboard_press_events'
            ];

            for (const columnName of columnsToRemove) {
                const columnExists = await queryRunner.query(`
                    SELECT COUNT(*) as count
                    FROM information_schema.columns
                    WHERE table_schema = DATABASE()
                    AND table_name = 'answers'
                    AND column_name = '${columnName}'
                `);

                const columnDownCount = parseInt(columnExists[0].count);
                if (columnDownCount > 0) {
                    await queryRunner.query(`ALTER TABLE answers DROP COLUMN ${columnName}`);
                }
            }
        }
    }
}


