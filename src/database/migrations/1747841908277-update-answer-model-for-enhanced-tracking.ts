import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAnswerModelForEnhancedTracking1747841908277 implements MigrationInterface {
    name = 'UpdateAnswerModelForEnhancedTracking1747841908277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add tracking_config to tests
        await queryRunner.query(`ALTER TABLE \`tests\` ADD \`tracking_config\` json NULL`);
        await queryRunner.query(`UPDATE \`tests\` SET \`tracking_config\` = JSON_OBJECT()`);
        await queryRunner.query(`ALTER TABLE \`tests\` MODIFY \`tracking_config\` json NOT NULL`);
        
        // Add new columns to answers table
        await queryRunner.query(`ALTER TABLE \`answers\` ADD \`focus_lost_events\` json NULL`);
        await queryRunner.query(`UPDATE \`answers\` SET \`focus_lost_events\` = JSON_ARRAY()`);
        
        await queryRunner.query(`ALTER TABLE \`answers\` ADD \`clipboard_events\` json NULL`);
        await queryRunner.query(`UPDATE \`answers\` SET \`clipboard_events\` = JSON_ARRAY()`);
        
        await queryRunner.query(`ALTER TABLE \`answers\` ADD \`pre_submit_delay\` float NOT NULL DEFAULT '0'`);
        
        await queryRunner.query(`ALTER TABLE \`answers\` ADD \`answer_change_events\` json NULL`);
        await queryRunner.query(`UPDATE \`answers\` SET \`answer_change_events\` = JSON_ARRAY()`);
        
        await queryRunner.query(`ALTER TABLE \`answers\` ADD \`device_fingerprint\` json NULL`);
        await queryRunner.query(`UPDATE \`answers\` SET \`device_fingerprint\` = JSON_OBJECT()`);
        
        await queryRunner.query(`ALTER TABLE \`answers\` ADD \`device_type\` varchar(10) NOT NULL DEFAULT 'desktop'`);
        await queryRunner.query(`ALTER TABLE \`answers\` ADD \`time_to_first_interaction\` float NOT NULL DEFAULT '0'`);
        
        await queryRunner.query(`ALTER TABLE \`answers\` ADD \`mouse_click_events\` json NULL`);
        await queryRunner.query(`UPDATE \`answers\` SET \`mouse_click_events\` = JSON_ARRAY()`);
        
        await queryRunner.query(`ALTER TABLE \`answers\` ADD \`keyboard_press_events\` json NULL`);
        await queryRunner.query(`UPDATE \`answers\` SET \`keyboard_press_events\` = JSON_ARRAY()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`answers\` DROP COLUMN \`keyboard_press_events\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP COLUMN \`mouse_click_events\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP COLUMN \`time_to_first_interaction\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP COLUMN \`device_type\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP COLUMN \`device_fingerprint\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP COLUMN \`answer_change_events\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP COLUMN \`pre_submit_delay\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP COLUMN \`clipboard_events\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP COLUMN \`focus_lost_events\``);
        await queryRunner.query(`ALTER TABLE \`tests\` DROP COLUMN \`tracking_config\``);
    }

}

