import { MigrationInterface, QueryRunner } from "typeorm";

export class AddJsonIndexes1748277581566 implements MigrationInterface {
    name = 'AddJsonIndexes1748277581566'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add indexes on JSON columns for better query performance
        // Note: MySQL 5.7+ supports functional indexes on JSON columns
        
        try {
            // Check MySQL version to determine if JSON functional indexes are supported
            const versionResult = await queryRunner.query('SELECT VERSION() as version');
            const version = versionResult[0].version;
            const majorVersion = parseInt(version.split('.')[0]);
            const minorVersion = parseInt(version.split('.')[1]);
            
            // MySQL 5.7+ supports JSON functional indexes
            if (majorVersion > 5 || (majorVersion === 5 && minorVersion >= 7)) {
                console.log('Adding JSON functional indexes for MySQL 5.7+');
                
                // Add functional indexes for commonly queried JSON fields
                await queryRunner.query(`
                    CREATE INDEX idx_answers_device_type 
                    ON answers ((CAST(device_type AS CHAR(10))))
                `);
                
                await queryRunner.query(`
                    CREATE INDEX idx_answers_focus_events_count 
                    ON answers ((JSON_LENGTH(focus_lost_events)))
                `);
                
                await queryRunner.query(`
                    CREATE INDEX idx_answers_clipboard_events_count 
                    ON answers ((JSON_LENGTH(clipboard_events)))
                `);
                
                await queryRunner.query(`
                    CREATE INDEX idx_answers_answer_changes_count 
                    ON answers ((JSON_LENGTH(answer_change_events)))
                `);
                
                await queryRunner.query(`
                    CREATE INDEX idx_answers_mouse_events_count 
                    ON answers ((JSON_LENGTH(mouse_click_events)))
                `);
                
                await queryRunner.query(`
                    CREATE INDEX idx_answers_keyboard_events_count 
                    ON answers ((JSON_LENGTH(keyboard_press_events)))
                `);
                
                console.log('JSON functional indexes created successfully');
            } else {
                console.log('MySQL version does not support JSON functional indexes, skipping index creation');
            }
            
        } catch (error) {
            console.error('Error creating JSON indexes:', error);
            // Don't fail the migration if indexes can't be created
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the indexes if they exist
        try {
            const indexes = [
                'idx_answers_device_type',
                'idx_answers_focus_events_count',
                'idx_answers_clipboard_events_count',
                'idx_answers_answer_changes_count',
                'idx_answers_mouse_events_count',
                'idx_answers_keyboard_events_count'
            ];
            
            for (const indexName of indexes) {
                try {
                    await queryRunner.query(`DROP INDEX ${indexName} ON answers`);
                    console.log(`Dropped index: ${indexName}`);
                } catch (error) {
                    console.log(`Index ${indexName} does not exist or could not be dropped`);
                }
            }
        } catch (error) {
            console.error('Error dropping JSON indexes:', error);
        }
    }
}
