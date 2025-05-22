import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailToProfiles1747900000000 implements MigrationInterface {
    name = 'AddEmailToProfiles1747900000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add email column to profiles table
        await queryRunner.query(`ALTER TABLE \`profiles\` ADD COLUMN \`email\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove email column from profiles table
        await queryRunner.query(`ALTER TABLE \`profiles\` DROP COLUMN \`email\``);
    }
}
