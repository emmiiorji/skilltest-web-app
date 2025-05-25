import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailToProfiles1748156000000 implements MigrationInterface {
    name = 'AddEmailToProfiles1748156000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('=== Add Email to Profiles Migration ===');

        // Check if profiles table exists
        const profilesTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'profiles'
        `);

        const profilesTableCount = parseInt(profilesTableExists[0].count);
        console.log('Profiles table exists:', profilesTableCount > 0);

        if (profilesTableCount > 0) {
            // Check if email column already exists
            const emailColumnExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                AND table_name = 'profiles'
                AND column_name = 'email'
            `);

            const emailColumnCount = parseInt(emailColumnExists[0].count);
            console.log('Email column exists:', emailColumnCount > 0);

            if (emailColumnCount === 0) {
                console.log('Adding email column to profiles table...');
                await queryRunner.query(`ALTER TABLE \`profiles\` ADD COLUMN \`email\` varchar(255) NULL`);
                console.log('Successfully added email column');
            } else {
                console.log('Email column already exists, skipping...');
            }
        } else {
            console.log('WARNING: profiles table does not exist');
        }

        console.log('=== Add Email Migration Complete ===');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('=== Reverting Add Email to Profiles Migration ===');

        // Check if profiles table exists
        const profilesTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'profiles'
        `);

        const profilesTableCount = parseInt(profilesTableExists[0].count);
        if (profilesTableCount > 0) {
            // Check if email column exists
            const emailColumnExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                AND table_name = 'profiles'
                AND column_name = 'email'
            `);

            const emailColumnCount = parseInt(emailColumnExists[0].count);
            if (emailColumnCount > 0) {
                console.log('Removing email column from profiles table...');
                await queryRunner.query(`ALTER TABLE \`profiles\` DROP COLUMN \`email\``);
                console.log('Email column removed');
            }
        }

        console.log('=== Revert Complete ===');
    }
}
