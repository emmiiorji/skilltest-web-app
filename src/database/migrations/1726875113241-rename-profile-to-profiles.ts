import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameProfileToProfiles1726875113241 implements MigrationInterface {
    name = 'RenameProfileToProfiles1726875113241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if source table 'profile' exists
        const profileTableExists = await queryRunner.hasTable("profile");
        if (!profileTableExists) {
            console.log("Source table 'profile' does not exist, skipping rename");
            return;
        }

        // Check if destination table 'profiles' already exists
        const profilesTableExists = await queryRunner.hasTable("profiles");
        if (profilesTableExists) {
            console.log("Destination table 'profiles' already exists, cannot rename");
            return;
        }

        try {
            // Simple table rename - MySQL handles foreign keys automatically
            await queryRunner.query(`RENAME TABLE \`profile\` TO \`profiles\``);
            
            console.log("Successfully renamed table 'profile' to 'profiles'");
        } catch (error) {
            console.error("Failed to rename table:", error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if 'profiles' table exists (the renamed table)
        const profilesTableExists = await queryRunner.hasTable("profiles");
        if (!profilesTableExists) {
            console.log("Table 'profiles' does not exist, nothing to rollback");
            return;
        }

        // Check if 'profile' table already exists (shouldn't exist if rename was successful)
        const profileTableExists = await queryRunner.hasTable("profile");
        if (profileTableExists) {
            console.log("Table 'profile' already exists, cannot rollback rename");
            return;
        }


        try {
            // 3. Rename back to original name
            await queryRunner.query(`RENAME TABLE \`profiles\` TO \`profile\``);
            
            console.log("Successfully rolled back table rename");
        } catch (error) {
            console.error("Failed to rollback table rename:", error instanceof Error ? error.message : String(error));
            throw error;
        }
    }
}
