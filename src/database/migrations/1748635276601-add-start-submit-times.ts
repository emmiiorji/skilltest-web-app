import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStartSubmitTimes1748635276601 implements MigrationInterface {
    name = 'AddStartSubmitTimes1748635276601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add start_time column to answers table
        await queryRunner.query(`
            ALTER TABLE \`answers\`
            ADD COLUMN \`start_time\` datetime NULL
        `);

        // Add submit_time column to answers table
        await queryRunner.query(`
            ALTER TABLE \`answers\`
            ADD COLUMN \`submit_time\` datetime NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove submit_time column from answers table
        await queryRunner.query(`
            ALTER TABLE \`answers\`
            DROP COLUMN \`submit_time\`
        `);

        // Remove start_time column from answers table
        await queryRunner.query(`
            ALTER TABLE \`answers\`
            DROP COLUMN \`start_time\`
        `);
    }
}
