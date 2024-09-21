import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingExtraTables1726875113240 implements MigrationInterface {
    name = 'AddingExtraTables1726875113240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`links\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`tag_id\` int NULL, \`link\` varchar(1000) NULL, \`active\` tinyint NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tags\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`profile_tags\` (\`profile_id\` int NOT NULL, \`tag_id\` int NOT NULL, PRIMARY KEY (\`profile_id\`, \`tag_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`queries\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`query\` varchar(1000) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`links\` ADD CONSTRAINT \`FK_50fb924b8150eb60e6287c99e61\` FOREIGN KEY (\`tag_id\`) REFERENCES \`tags\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`profile_tags\` ADD CONSTRAINT \`FK_badb116eb5063aeadd9a2d9b6db\` FOREIGN KEY (\`profile_id\`) REFERENCES \`profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`profile_tags\` ADD CONSTRAINT \`FK_abd812637001d08946f8c59288a\` FOREIGN KEY (\`tag_id\`) REFERENCES \`tags\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`profile_tags\` DROP FOREIGN KEY \`FK_abd812637001d08946f8c59288a\``);
        await queryRunner.query(`ALTER TABLE \`profile_tags\` DROP FOREIGN KEY \`FK_badb116eb5063aeadd9a2d9b6db\``);
        await queryRunner.query(`ALTER TABLE \`links\` DROP FOREIGN KEY \`FK_50fb924b8150eb60e6287c99e61\``);
        await queryRunner.query(`DROP TABLE \`queries\``);
        await queryRunner.query(`DROP TABLE \`profile_tags\``);
        await queryRunner.query(`DROP TABLE \`tags\``);
        await queryRunner.query(`DROP TABLE \`links\``);
    }

}
