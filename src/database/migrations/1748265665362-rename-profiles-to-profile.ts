import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameProilesToProfile1748265665362 implements MigrationInterface {
    name = 'RenameProilesToProfile1748265665362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('=== Rename Profiles to Profile Migration ===');

        // Check if source table 'profiles' exists
        const profilesTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'profiles'
        `);

        const profilesTableCount = parseInt(profilesTableExists[0].count);
        console.log('Profiles table exists:', profilesTableCount > 0);

        if (profilesTableCount === 0) {
            console.log("Source table 'profiles' does not exist, skipping rename");
            return;
        }

        // Check if destination table 'profile' already exists
        const profileTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'profile'
        `);

        const profileTableCount = parseInt(profileTableExists[0].count);
        if (profileTableCount > 0) {
            console.log("Destination table 'profile' already exists, cannot rename");
            return;
        }

        try {
            // Step 1: Drop foreign key constraints that reference profiles table
            console.log('Dropping foreign key constraints...');

            // Check and drop constraints from profiles_groups table
            const profilesGroupsExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.tables
                WHERE table_schema = DATABASE()
                AND table_name = 'profiles_groups'
            `);

            if (parseInt(profilesGroupsExists[0].count) > 0) {
                // Check if foreign key constraint exists before dropping
                const fkProfilesGroupsExists = await queryRunner.query(`
                    SELECT COUNT(*) as count
                    FROM information_schema.key_column_usage
                    WHERE table_schema = DATABASE()
                    AND table_name = 'profiles_groups'
                    AND constraint_name = 'FK_536cca102bd5ef9f2be781d90c0'
                `);

                if (parseInt(fkProfilesGroupsExists[0].count) > 0) {
                    await queryRunner.query(`ALTER TABLE \`profiles_groups\` DROP FOREIGN KEY \`FK_536cca102bd5ef9f2be781d90c0\``);
                }
            }

            // Check and drop constraints from tests_profiles table
            const testsProfilesExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.tables
                WHERE table_schema = DATABASE()
                AND table_name = 'tests_profiles'
            `);

            if (parseInt(testsProfilesExists[0].count) > 0) {
                // Check if foreign key constraint exists before dropping
                const fkTestsProfilesExists = await queryRunner.query(`
                    SELECT COUNT(*) as count
                    FROM information_schema.key_column_usage
                    WHERE table_schema = DATABASE()
                    AND table_name = 'tests_profiles'
                    AND constraint_name = 'FK_391cab40370a0a8532b908dddf'
                `);

                if (parseInt(fkTestsProfilesExists[0].count) > 0) {
                    await queryRunner.query(`ALTER TABLE \`tests_profiles\` DROP FOREIGN KEY \`FK_391cab40370a0a8532b908dddf\``);
                }
            }

            // Check and drop constraints from profile_tags table
            const profileTagsExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.tables
                WHERE table_schema = DATABASE()
                AND table_name = 'profile_tags'
            `);

            if (parseInt(profileTagsExists[0].count) > 0) {
                // Check if foreign key constraint exists before dropping
                const fkProfileTagsExists = await queryRunner.query(`
                    SELECT COUNT(*) as count
                    FROM information_schema.key_column_usage
                    WHERE table_schema = DATABASE()
                    AND table_name = 'profile_tags'
                    AND constraint_name = 'FK_abd812637001d08946f8c59288a'
                `);

                if (parseInt(fkProfileTagsExists[0].count) > 0) {
                    await queryRunner.query(`ALTER TABLE \`profile_tags\` DROP FOREIGN KEY \`FK_abd812637001d08946f8c59288a\``);
                }
            }

            // Check and drop constraints from answers table
            const answersExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.tables
                WHERE table_schema = DATABASE()
                AND table_name = 'answers'
            `);

            if (parseInt(answersExists[0].count) > 0) {
                // Check if foreign key constraint exists before dropping
                const fkAnswersExists = await queryRunner.query(`
                    SELECT COUNT(*) as count
                    FROM information_schema.key_column_usage
                    WHERE table_schema = DATABASE()
                    AND table_name = 'answers'
                    AND referenced_table_name = 'profiles'
                `);

                if (parseInt(fkAnswersExists[0].count) > 0) {
                    // Get the actual constraint name
                    const constraintName = await queryRunner.query(`
                        SELECT constraint_name
                        FROM information_schema.key_column_usage
                        WHERE table_schema = DATABASE()
                        AND table_name = 'answers'
                        AND referenced_table_name = 'profiles'
                        LIMIT 1
                    `);

                    if (constraintName.length > 0) {
                        await queryRunner.query(`ALTER TABLE \`answers\` DROP FOREIGN KEY \`${constraintName[0].constraint_name}\``);
                    }
                }
            }

            // Step 2: Rename the table
            console.log('Renaming table profiles to profile...');
            await queryRunner.query(`RENAME TABLE \`profiles\` TO \`profile\``);

            // Step 3: Recreate foreign key constraints with new table name
            console.log('Recreating foreign key constraints...');

            // Recreate profiles_groups constraint
            if (parseInt(profilesGroupsExists[0].count) > 0) {
                await queryRunner.query(`ALTER TABLE \`profiles_groups\` ADD CONSTRAINT \`FK_536cca102bd5ef9f2be781d90c0\` FOREIGN KEY (\`profileId\`) REFERENCES \`profile\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
            }

            // Recreate tests_profiles constraint
            if (parseInt(testsProfilesExists[0].count) > 0) {
                await queryRunner.query(`ALTER TABLE \`tests_profiles\` ADD CONSTRAINT \`FK_391cab40370a0a8532b908dddf\` FOREIGN KEY (\`profileId\`) REFERENCES \`profile\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
            }

            // Recreate profile_tags constraint
            if (parseInt(profileTagsExists[0].count) > 0) {
                await queryRunner.query(`ALTER TABLE \`profile_tags\` ADD CONSTRAINT \`FK_abd812637001d08946f8c59288a\` FOREIGN KEY (\`profile_id\`) REFERENCES \`profile\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
            }

            // Recreate answers constraint
            if (parseInt(answersExists[0].count) > 0) {
                await queryRunner.query(`ALTER TABLE \`answers\` ADD CONSTRAINT \`FK_answers_profile_id\` FOREIGN KEY (\`profile_id\`) REFERENCES \`profile\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
            }

            console.log("Successfully renamed table 'profiles' to 'profile' and updated all references");
        } catch (error) {
            console.error("Failed to rename table:", error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('=== Rollback Rename Profiles to Profile Migration ===');

        // Check if 'profile' table exists (the renamed table)
        const profileTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'profile'
        `);

        const profileTableCount = parseInt(profileTableExists[0].count);
        if (profileTableCount === 0) {
            console.log("Table 'profile' does not exist, nothing to rollback");
            return;
        }

        // Check if 'profiles' table already exists (shouldn't exist if rename was successful)
        const profilesTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'profiles'
        `);

        const profilesTableCount = parseInt(profilesTableExists[0].count);
        if (profilesTableCount > 0) {
            console.log("Table 'profiles' already exists, cannot rollback rename");
            return;
        }

        try {
            // Step 1: Drop foreign key constraints that reference profile table
            console.log('Dropping foreign key constraints...');

            // Check and drop constraints from profiles_groups table
            const profilesGroupsExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.tables
                WHERE table_schema = DATABASE()
                AND table_name = 'profiles_groups'
            `);

            if (parseInt(profilesGroupsExists[0].count) > 0) {
                const fkProfilesGroupsExists = await queryRunner.query(`
                    SELECT COUNT(*) as count
                    FROM information_schema.key_column_usage
                    WHERE table_schema = DATABASE()
                    AND table_name = 'profiles_groups'
                    AND constraint_name = 'FK_536cca102bd5ef9f2be781d90c0'
                `);

                if (parseInt(fkProfilesGroupsExists[0].count) > 0) {
                    await queryRunner.query(`ALTER TABLE \`profiles_groups\` DROP FOREIGN KEY \`FK_536cca102bd5ef9f2be781d90c0\``);
                }
            }

            // Check and drop constraints from tests_profiles table
            const testsProfilesExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.tables
                WHERE table_schema = DATABASE()
                AND table_name = 'tests_profiles'
            `);

            if (parseInt(testsProfilesExists[0].count) > 0) {
                const fkTestsProfilesExists = await queryRunner.query(`
                    SELECT COUNT(*) as count
                    FROM information_schema.key_column_usage
                    WHERE table_schema = DATABASE()
                    AND table_name = 'tests_profiles'
                    AND constraint_name = 'FK_391cab40370a0a8532b908dddf'
                `);

                if (parseInt(fkTestsProfilesExists[0].count) > 0) {
                    await queryRunner.query(`ALTER TABLE \`tests_profiles\` DROP FOREIGN KEY \`FK_391cab40370a0a8532b908dddf\``);
                }
            }

            // Check and drop constraints from profile_tags table
            const profileTagsExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.tables
                WHERE table_schema = DATABASE()
                AND table_name = 'profile_tags'
            `);

            if (parseInt(profileTagsExists[0].count) > 0) {
                const fkProfileTagsExists = await queryRunner.query(`
                    SELECT COUNT(*) as count
                    FROM information_schema.key_column_usage
                    WHERE table_schema = DATABASE()
                    AND table_name = 'profile_tags'
                    AND constraint_name = 'FK_abd812637001d08946f8c59288a'
                `);

                if (parseInt(fkProfileTagsExists[0].count) > 0) {
                    await queryRunner.query(`ALTER TABLE \`profile_tags\` DROP FOREIGN KEY \`FK_abd812637001d08946f8c59288a\``);
                }
            }

            // Check and drop constraints from answers table
            const answersExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.tables
                WHERE table_schema = DATABASE()
                AND table_name = 'answers'
            `);

            if (parseInt(answersExists[0].count) > 0) {
                const fkAnswersExists = await queryRunner.query(`
                    SELECT COUNT(*) as count
                    FROM information_schema.key_column_usage
                    WHERE table_schema = DATABASE()
                    AND table_name = 'answers'
                    AND constraint_name = 'FK_answers_profile_id'
                `);

                if (parseInt(fkAnswersExists[0].count) > 0) {
                    await queryRunner.query(`ALTER TABLE \`answers\` DROP FOREIGN KEY \`FK_answers_profile_id\``);
                }
            }

            // Step 2: Rename back to original name
            console.log('Renaming table profile back to profiles...');
            await queryRunner.query(`RENAME TABLE \`profile\` TO \`profiles\``);

            // Step 3: Recreate foreign key constraints with original table name
            console.log('Recreating foreign key constraints...');

            // Recreate profiles_groups constraint
            if (parseInt(profilesGroupsExists[0].count) > 0) {
                await queryRunner.query(`ALTER TABLE \`profiles_groups\` ADD CONSTRAINT \`FK_536cca102bd5ef9f2be781d90c0\` FOREIGN KEY (\`profileId\`) REFERENCES \`profiles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
            }

            // Recreate tests_profiles constraint
            if (parseInt(testsProfilesExists[0].count) > 0) {
                await queryRunner.query(`ALTER TABLE \`tests_profiles\` ADD CONSTRAINT \`FK_391cab40370a0a8532b908dddf\` FOREIGN KEY (\`profileId\`) REFERENCES \`profiles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
            }

            // Recreate profile_tags constraint
            if (parseInt(profileTagsExists[0].count) > 0) {
                await queryRunner.query(`ALTER TABLE \`profile_tags\` ADD CONSTRAINT \`FK_abd812637001d08946f8c59288a\` FOREIGN KEY (\`profile_id\`) REFERENCES \`profiles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
            }

            // Recreate answers constraint (find the original constraint name)
            if (parseInt(answersExists[0].count) > 0) {
                // Use a generic constraint name for rollback
                await queryRunner.query(`ALTER TABLE \`answers\` ADD CONSTRAINT \`FK_answers_profiles_id\` FOREIGN KEY (\`profile_id\`) REFERENCES \`profiles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
            }

            console.log("Successfully rolled back table rename from 'profile' to 'profiles'");
        } catch (error) {
            console.error("Failed to rollback table rename:", error instanceof Error ? error.message : String(error));
            throw error;
        }
    }
}