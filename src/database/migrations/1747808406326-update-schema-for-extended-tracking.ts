import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchemaForExtendedTracking1747808406326 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add tracking config to tests
        await queryRunner.query(`ALTER TABLE tests ADD COLUMN tracking_config JSON NOT NULL DEFAULT '{}'`);

        // 2. Add new columns to answers table
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN focus_lost_events JSON DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN clipboard_events JSON DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN pre_submit_delay FLOAT DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN answer_change_events JSON DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN device_fingerprint JSON DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN device_type VARCHAR(10) DEFAULT 'desktop'`);
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN time_to_first_interaction FLOAT DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN mouse_click_events JSON DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN keyboard_press_events JSON DEFAULT '[]'`);

        // 3. Update tracking config for existing tests
        await queryRunner.query(`UPDATE tests SET tracking_config = '{}' WHERE id = 1`);
        
        await queryRunner.query(`UPDATE tests SET tracking_config = '{"disableFocusLostEvents":true,"disableMouseClickEvents":true,"disableKeyboardPressEvents":true,"disableDeviceFingerprint":true}' WHERE id = 2`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert test config changes
        await queryRunner.query(`UPDATE tests SET tracking_config = '{}' WHERE id IN (1, 2)`);

        // Remove the tracking_config column from tests
        await queryRunner.query(`ALTER TABLE tests DROP COLUMN tracking_config`);

        // Remove newly added columns from answers table
        await queryRunner.query(`ALTER TABLE answers DROP COLUMN focus_lost_events`);
        await queryRunner.query(`ALTER TABLE answers DROP COLUMN clipboard_events`);
        await queryRunner.query(`ALTER TABLE answers DROP COLUMN pre_submit_delay`);
        await queryRunner.query(`ALTER TABLE answers DROP COLUMN answer_change_events`);
        await queryRunner.query(`ALTER TABLE answers DROP COLUMN device_fingerprint`);
        await queryRunner.query(`ALTER TABLE answers DROP COLUMN device_type`);
        await queryRunner.query(`ALTER TABLE answers DROP COLUMN time_to_first_interaction`);
        await queryRunner.query(`ALTER TABLE answers DROP COLUMN mouse_click_events`);
        await queryRunner.query(`ALTER TABLE answers DROP COLUMN keyboard_press_events`);
    }
}

