import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameProfileToProfiles1726875113241 implements MigrationInterface {
    name = 'RenameProfileToProfiles1726875113241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Check if source table 'profile' exists
        const profileTableExists = await queryRunner.hasTable("profile");
        if (!profileTableExists) {
            return;
        }

        // 2. Check if destination table 'profiles' already exists
        const profilesTableExists = await queryRunner.hasTable("profiles");
        if (profilesTableExists) {
            return;
        }

        try {
            // 3. Perform table rename
            await queryRunner.query(`RENAME TABLE \`profile\` TO \`profiles\``);

            // 4. Verify the rename was successful
            const newTableExists = await queryRunner.hasTable("profiles");
            const oldTableExists = await queryRunner.hasTable("profile");

            if (newTableExists && !oldTableExists) {
                // 5. Get record count for confirmation
            } else {
                throw new Error("Table rename verification failed");
            }

            // 6. Update any foreign key references if they exist
            await this.updateForeignKeyReferences(queryRunner);

        } catch (error) {
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Check if 'profiles' table exists (the renamed table)
        const profilesTableExists = await queryRunner.hasTable("profiles");
        if (!profilesTableExists) {
            return;
        }

        // 2. Check if 'profile' table already exists (shouldn't exist if rename was successful)
        const profileTableExists = await queryRunner.hasTable("profile");
        if (profileTableExists) {
            return;
        }

        try {
            // 3. Rename back to original name
            await queryRunner.query(`RENAME TABLE \`profiles\` TO \`profile\``);

            // 4. Verify rollback
            const originalTableExists = await queryRunner.hasTable("profile");
            const renamedTableExists = await queryRunner.hasTable("profiles");

            // 5. Rollback foreign key reference updates
            await this.rollbackForeignKeyReferences(queryRunner);

        } catch (error) {
            throw error;
        }
    }

    private async updateForeignKeyReferences(queryRunner: QueryRunner): Promise<void> {
        try {
            // Find all foreign keys that reference the old table name
            const foreignKeys = await queryRunner.query(`
                SELECT
                    TABLE_NAME,
                    CONSTRAINT_NAME,
                    COLUMN_NAME,
                    REFERENCED_TABLE_NAME,
                    REFERENCED_COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE REFERENCED_TABLE_NAME = 'profile'
                AND TABLE_SCHEMA = DATABASE()
            `);

            if (foreignKeys.length === 0) {
                return;
            }

            for (const fk of foreignKeys) {
                try {
                    // Drop the old foreign key
                    await queryRunner.query(`
                        ALTER TABLE \`${fk.TABLE_NAME}\`
                        DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\`
                    `);

                    // Recreate with new table reference
                    await queryRunner.query(`
                        ALTER TABLE \`${fk.TABLE_NAME}\`
                        ADD CONSTRAINT \`${fk.CONSTRAINT_NAME}\`
                        FOREIGN KEY (\`${fk.COLUMN_NAME}\`)
                        REFERENCES \`profiles\`(\`${fk.REFERENCED_COLUMN_NAME}\`)
                        ON DELETE CASCADE
                    `);

                } catch (error) {
                }
            }

        } catch (error) {
            console.log("Error updating foreign key references:", error instanceof Error ? error.message : String(error));
        }
    }

    private async rollbackForeignKeyReferences(queryRunner: QueryRunner): Promise<void> {
        try {
            // Find all foreign keys that reference the renamed table
            const foreignKeys = await queryRunner.query(`
                SELECT
                    TABLE_NAME,
                    CONSTRAINT_NAME,
                    COLUMN_NAME,
                    REFERENCED_TABLE_NAME,
                    REFERENCED_COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE REFERENCED_TABLE_NAME = 'profiles'
                AND TABLE_SCHEMA = DATABASE()
            `);

            for (const fk of foreignKeys) {
                try {
                    // Drop the foreign key
                    await queryRunner.query(`
                        ALTER TABLE \`${fk.TABLE_NAME}\`
                        DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\`
                    `);

                    // Recreate with original table reference
                    await queryRunner.query(`
                        ALTER TABLE \`${fk.TABLE_NAME}\`
                        ADD CONSTRAINT \`${fk.CONSTRAINT_NAME}\`
                        FOREIGN KEY (\`${fk.COLUMN_NAME}\`)
                        REFERENCES \`profile\`(\`${fk.REFERENCED_COLUMN_NAME}\`)
                        ON DELETE CASCADE
                    `);

                } catch (error) {
                    console.log(`Failed to rollback foreign key ${fk.CONSTRAINT_NAME}:`, error instanceof Error ? error.message : String(error));
                }
            }

        } catch (error) {
            console.log("Error rolling back foreign key references:", error instanceof Error ? error.message : String(error));
        }
    }
}

// Alternative simpler version without foreign key handling
export class SimpleRenameProfileToProfiles1726875113242 implements MigrationInterface {
    name = 'SimpleRenameProfileToProfiles1726875113242'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const profileExists = await queryRunner.hasTable("profile");
        const profilesExists = await queryRunner.hasTable("profiles");

        if (!profileExists) {
            return;
        }

        if (profilesExists) {
            return;
        }

        try {
            await queryRunner.query(`RENAME TABLE \`profile\` TO \`profiles\``);
        } catch (error) {
            console.error("Rename failed:", error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const profilesExists = await queryRunner.hasTable("profiles");
        const profileExists = await queryRunner.hasTable("profile");

        if (!profilesExists) {
            console.log("Table 'profiles' does not exist, nothing to rollback");
            return;
        }

        if (profileExists) {
            console.log("Table 'profile' already exists, cannot rollback");
            return;
        }

        try {
            await queryRunner.query(`RENAME TABLE \`profiles\` TO \`profile\``);
            console.log("Successfully rolled back rename");
        } catch (error) {
            console.error("Rollback failed:", error instanceof Error ? error.message : String(error));
            throw error;
        }
    }
}

// Version with backup creation before rename
export class SafeRenameProfileToProfiles1726875113243 implements MigrationInterface {
    name = 'SafeRenameProfileToProfiles1726875113243'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const profileExists = await queryRunner.hasTable("profile");
        if (!profileExists) {
            console.log("Table 'profile' does not exist");
            return;
        }

        const profilesExists = await queryRunner.hasTable("profiles");
        if (profilesExists) {
            console.log("Table 'profiles' already exists");
            return;
        }

        try {
            // 1. Create backup first
            const backupExists = await queryRunner.hasTable("profile_backup");
            if (!backupExists) {
                await queryRunner.query(`CREATE TABLE \`profile_backup\` LIKE \`profile\``);
                await queryRunner.query(`INSERT INTO \`profile_backup\` SELECT * FROM \`profile\``);
                console.log("Created backup table 'profile_backup'");
            }

            // 2. Perform rename
            await queryRunner.query(`RENAME TABLE \`profile\` TO \`profiles\``);
            console.log("Successfully renamed 'profile' to 'profiles'");

            // 3. Verify
            const recordCount = await queryRunner.query(`SELECT COUNT(*) as count FROM \`profiles\``);
            console.log(`Renamed table contains ${recordCount[0].count} records`);

        } catch (error) {
            console.error("Safe rename failed:", error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            // Restore from backup if it exists
            const backupExists = await queryRunner.hasTable("profile_backup");
            if (backupExists) {
                await queryRunner.query(`DROP TABLE IF EXISTS \`profiles\``);
                await queryRunner.query(`RENAME TABLE \`profile_backup\` TO \`profile\``);
                console.log("Restored from backup");
            } else {
                // Fallback to simple rename
                await queryRunner.query(`RENAME TABLE \`profiles\` TO \`profile\``);
                console.log("Simple rollback completed");
            }
        } catch (error) {
            console.error("Rollback failed:", error instanceof Error ? error.message : String(error));
            throw error;
        }
    }
}

