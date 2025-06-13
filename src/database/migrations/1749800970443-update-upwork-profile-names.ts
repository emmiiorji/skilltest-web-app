import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUpworkProfileNames1749800970443 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update profile names that contain 'upwork.com' and match the regex pattern
        // Extract only the username part using the same regex as in testCreate.controller.ts: /(~?([a-zA-Z0-9]+))$/

        // Gt all profiles that contain 'upwork.com' in their name field
        const profilesWithUpworkNames = await queryRunner.query(`
            SELECT id, name
            FROM profile
            WHERE name LIKE '%upwork.com%'
        `);

        console.log(`Found ${profilesWithUpworkNames.length} profiles with upwork.com names to update`);

        // Process each profile individually to apply the regex extraction
        for (const profile of profilesWithUpworkNames) {
            const originalName = profile.name;

            // Apply the same regex pattern as in the controller: /(~?([a-zA-Z0-9]+))$/
            const match = originalName.match(/(~?([a-zA-Z0-9]+))$/);

            if (match && match[2]) {
                const username = match[2];

                // Check if this username already exists to avoid unique constraint violations
                const existingProfile = await queryRunner.query(`
                    SELECT id FROM profile WHERE name = ? AND id != ?
                `, [username, profile.id]);

                if (existingProfile.length > 0) {
                    console.log(`WARNING: Username "${username}" already exists for profile ${existingProfile[0].id}. Skipping profile ${profile.id}: "${originalName}"`);
                    console.log(`You may need to manually resolve this duplicate: profile ${profile.id} with name "${originalName}"`);
                    continue;
                }

                try {
                    // Update the profile name to contain only the username
                    await queryRunner.query(`
                        UPDATE profile
                        SET name = ?
                        WHERE id = ?
                    `, [username, profile.id]);

                    console.log(`Updated profile ${profile.id}: "${originalName}" -> "${username}"`);
                } catch (error) {
                    console.log(`ERROR updating profile ${profile.id}: ${error}`);
                    console.log(`Original name: "${originalName}", attempted username: "${username}"`);
                }
            } else {
                console.log(`Skipping profile ${profile.id}: "${originalName}" - does not match expected pattern`);
            }
        }

        console.log('Profile name update migration completed');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: This migration cannot be easily reverted because we lose the original URL information
        // when we extract just the username. To revert, you would need to manually restore the
        // original upwork.com URLs from a backup or other source.

        console.log('WARNING: This migration cannot be automatically reverted.');
        console.log('The original upwork.com URLs have been replaced with usernames only.');
        console.log('To restore original URLs, you would need to manually update the profile names');
        console.log('or restore from a database backup taken before this migration was run.');

        throw new Error('Migration cannot be automatically reverted. Manual intervention required.');
    }

}
