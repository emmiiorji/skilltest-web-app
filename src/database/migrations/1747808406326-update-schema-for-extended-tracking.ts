import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchemaForExtendedTracking1747808406326 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            -- 1. Add tracking config to tests
            ALTER TABLE tests ADD COLUMN tracking_config JSON NOT NULL DEFAULT '{}';

            -- 2. Add new columns to answers table
            ALTER TABLE answers 
                ADD COLUMN focus_lost_events JSON DEFAULT '[]',
                ADD COLUMN clipboard_events JSON DEFAULT '[]',
                ADD COLUMN pre_submit_delay FLOAT DEFAULT 0,
                ADD COLUMN answer_change_events JSON DEFAULT '[]',
                ADD COLUMN device_fingerprint JSON DEFAULT '{}',
                ADD COLUMN device_type VARCHAR(10) DEFAULT 'desktop',
                ADD COLUMN time_to_first_interaction FLOAT DEFAULT 0,
                ADD COLUMN mouse_click_events JSON DEFAULT '[]',
                ADD COLUMN keyboard_press_events JSON DEFAULT '[]';

            -- 3. Update tracking config for existing tests
            UPDATE tests SET tracking_config = '{}' WHERE id = 1;

            UPDATE tests SET tracking_config = '{
                "disableFocusLostEvents": true,
                "disableMouseClickEvents": true,
                "disableKeyboardPressEvents": true,
                "disableDeviceFingerprint": true
            }' WHERE id = 2;
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            -- Revert test config changes
            UPDATE tests SET tracking_config = '{}' WHERE id IN (1, 2);

            -- Remove the tracking_config column from tests
            ALTER TABLE tests DROP COLUMN tracking_config;

            -- Remove newly added columns from answers table
            ALTER TABLE answers 
                DROP COLUMN focus_lost_events,
                DROP COLUMN clipboard_events,
                DROP COLUMN pre_submit_delay,
                DROP COLUMN answer_change_events,
                DROP COLUMN device_fingerprint,
                DROP COLUMN device_type,
                DROP COLUMN time_to_first_interaction,
                DROP COLUMN mouse_click_events,
                DROP COLUMN keyboard_press_events;
        `);

    }

}
