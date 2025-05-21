import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchemaForExtendedTracking1747808406326 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add tracking config to tests (without default value)
        await queryRunner.query(`ALTER TABLE tests ADD COLUMN tracking_config JSON NULL`);
        
        // Set default value for all rows
        await queryRunner.query(`UPDATE tests SET tracking_config = JSON_OBJECT()`);
        
        // Make it NOT NULL after setting values
        await queryRunner.query(`ALTER TABLE tests MODIFY COLUMN tracking_config JSON NOT NULL`);

        // 2. Add new columns to answers table
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN focus_lost_events JSON NULL`);
        await queryRunner.query(`UPDATE answers SET focus_lost_events = JSON_ARRAY()`);
        
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN clipboard_events JSON NULL`);
        await queryRunner.query(`UPDATE answers SET clipboard_events = JSON_ARRAY()`);
        
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN pre_submit_delay FLOAT DEFAULT 0`);
        
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN answer_change_events JSON NULL`);
        await queryRunner.query(`UPDATE answers SET answer_change_events = JSON_ARRAY()`);
        
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN device_fingerprint JSON NULL`);
        await queryRunner.query(`UPDATE answers SET device_fingerprint = JSON_OBJECT()`);
        
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN device_type VARCHAR(10) DEFAULT 'desktop'`);
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN time_to_first_interaction FLOAT DEFAULT 0`);
        
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN mouse_click_events JSON NULL`);
        await queryRunner.query(`UPDATE answers SET mouse_click_events = JSON_ARRAY()`);
        
        await queryRunner.query(`ALTER TABLE answers ADD COLUMN keyboard_press_events JSON NULL`);
        await queryRunner.query(`UPDATE answers SET keyboard_press_events = JSON_ARRAY()`);

        // 3. Update tracking config for existing tests
        await queryRunner.query(`UPDATE tests SET tracking_config = JSON_OBJECT() WHERE id = 1`);
        
        const config = JSON.stringify({
            disableFocusLostEvents: true,
            disableMouseClickEvents: true,
            disableKeyboardPressEvents: true,
            disableDeviceFingerprint: true
        });
        await queryRunner.query(`UPDATE tests SET tracking_config = CAST('${config}' AS JSON) WHERE id = 2`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert test config changes
        await queryRunner.query(`UPDATE tests SET tracking_config = JSON_OBJECT() WHERE id IN (1, 2)`);

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


