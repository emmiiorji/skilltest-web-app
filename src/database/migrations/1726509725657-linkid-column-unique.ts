import { MigrationInterface, QueryRunner } from "typeorm";

export class LinkidColumnUnique1726509725657 implements MigrationInterface {
    name = 'LinkidColumnUnique1726509725657'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`profile\` CHANGE \`link\` \`link\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`profile\` ADD UNIQUE INDEX \`IDX_06bd69d723b1cdda96abfe88a7\` (\`link\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`profile\` DROP INDEX \`IDX_06bd69d723b1cdda96abfe88a7\``);
        await queryRunner.query(`ALTER TABLE \`profile\` CHANGE \`link\` \`link\` varchar(255) NULL`);
    }

}
