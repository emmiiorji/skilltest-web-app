import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1726094458806 implements MigrationInterface {
    name = 'InitialMigration1726094458806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`profile\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`link\` varchar(255) NULL, \`url\` varchar(255) NULL, \`name\` varchar(255) NOT NULL, \`country\` varchar(255) NULL, \`title\` varchar(255) NULL, \`description\` text NULL, \`lastActivity\` datetime NULL, \`earned\` decimal(10,2) NULL, \`rate\` decimal(5,2) NULL, \`totalHours\` int NULL, \`inProgress\` tinyint NULL, \`invitedAt\` datetime NULL, \`shortname\` varchar(100) NULL, \`recno\` int NULL, \`agencies\` text NULL, \`totalRevenue\` decimal(10,2) NULL, \`memberSince\` datetime NULL, \`vanityUrl\` varchar(255) NULL, \`skills\` text NULL, \`process\` text NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`groups\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`templates\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`template\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tests\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`group_profiles\` (\`groupsId\` int NOT NULL, \`profileId\` int NOT NULL, INDEX \`IDX_20d0aac9050baa5a6ec674c277\` (\`groupsId\`), INDEX \`IDX_ad85197d868d5082bb27b449aa\` (\`profileId\`), PRIMARY KEY (\`groupsId\`, \`profileId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tests_profiles\` (\`testsId\` int NOT NULL, \`profileId\` int NOT NULL, INDEX \`IDX_3447eea96a1654cc257656b33f\` (\`testsId\`), INDEX \`IDX_391cab40370a0a8532b908dddf\` (\`profileId\`), PRIMARY KEY (\`testsId\`, \`profileId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tests_groups\` (\`testsId\` int NOT NULL, \`groupsId\` int NOT NULL, INDEX \`IDX_60d5c7720cab52d359c14ee351\` (\`testsId\`), INDEX \`IDX_19286afc7f75d5ef6283eb8422\` (\`groupsId\`), PRIMARY KEY (\`testsId\`, \`groupsId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tests_templates\` (\`testsId\` int NOT NULL, \`templatesId\` int NOT NULL, INDEX \`IDX_ddb2d7254f8bd9200d85fc0530\` (\`testsId\`), INDEX \`IDX_31918228133cb9364ec1d1fbc8\` (\`templatesId\`), PRIMARY KEY (\`testsId\`, \`templatesId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`group_profiles\` ADD CONSTRAINT \`FK_20d0aac9050baa5a6ec674c2775\` FOREIGN KEY (\`groupsId\`) REFERENCES \`groups\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`group_profiles\` ADD CONSTRAINT \`FK_ad85197d868d5082bb27b449aac\` FOREIGN KEY (\`profileId\`) REFERENCES \`profile\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tests_profiles\` ADD CONSTRAINT \`FK_3447eea96a1654cc257656b33fd\` FOREIGN KEY (\`testsId\`) REFERENCES \`tests\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tests_profiles\` ADD CONSTRAINT \`FK_391cab40370a0a8532b908dddf2\` FOREIGN KEY (\`profileId\`) REFERENCES \`profile\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tests_groups\` ADD CONSTRAINT \`FK_60d5c7720cab52d359c14ee3510\` FOREIGN KEY (\`testsId\`) REFERENCES \`tests\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tests_groups\` ADD CONSTRAINT \`FK_19286afc7f75d5ef6283eb8422a\` FOREIGN KEY (\`groupsId\`) REFERENCES \`groups\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tests_templates\` ADD CONSTRAINT \`FK_ddb2d7254f8bd9200d85fc0530c\` FOREIGN KEY (\`testsId\`) REFERENCES \`tests\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tests_templates\` ADD CONSTRAINT \`FK_31918228133cb9364ec1d1fbc83\` FOREIGN KEY (\`templatesId\`) REFERENCES \`templates\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tests_templates\` DROP FOREIGN KEY \`FK_31918228133cb9364ec1d1fbc83\``);
        await queryRunner.query(`ALTER TABLE \`tests_templates\` DROP FOREIGN KEY \`FK_ddb2d7254f8bd9200d85fc0530c\``);
        await queryRunner.query(`ALTER TABLE \`tests_groups\` DROP FOREIGN KEY \`FK_19286afc7f75d5ef6283eb8422a\``);
        await queryRunner.query(`ALTER TABLE \`tests_groups\` DROP FOREIGN KEY \`FK_60d5c7720cab52d359c14ee3510\``);
        await queryRunner.query(`ALTER TABLE \`tests_profiles\` DROP FOREIGN KEY \`FK_391cab40370a0a8532b908dddf2\``);
        await queryRunner.query(`ALTER TABLE \`tests_profiles\` DROP FOREIGN KEY \`FK_3447eea96a1654cc257656b33fd\``);
        await queryRunner.query(`ALTER TABLE \`group_profiles\` DROP FOREIGN KEY \`FK_ad85197d868d5082bb27b449aac\``);
        await queryRunner.query(`ALTER TABLE \`group_profiles\` DROP FOREIGN KEY \`FK_20d0aac9050baa5a6ec674c2775\``);
        await queryRunner.query(`DROP INDEX \`IDX_31918228133cb9364ec1d1fbc8\` ON \`tests_templates\``);
        await queryRunner.query(`DROP INDEX \`IDX_ddb2d7254f8bd9200d85fc0530\` ON \`tests_templates\``);
        await queryRunner.query(`DROP TABLE \`tests_templates\``);
        await queryRunner.query(`DROP INDEX \`IDX_19286afc7f75d5ef6283eb8422\` ON \`tests_groups\``);
        await queryRunner.query(`DROP INDEX \`IDX_60d5c7720cab52d359c14ee351\` ON \`tests_groups\``);
        await queryRunner.query(`DROP TABLE \`tests_groups\``);
        await queryRunner.query(`DROP INDEX \`IDX_391cab40370a0a8532b908dddf\` ON \`tests_profiles\``);
        await queryRunner.query(`DROP INDEX \`IDX_3447eea96a1654cc257656b33f\` ON \`tests_profiles\``);
        await queryRunner.query(`DROP TABLE \`tests_profiles\``);
        await queryRunner.query(`DROP INDEX \`IDX_ad85197d868d5082bb27b449aa\` ON \`group_profiles\``);
        await queryRunner.query(`DROP INDEX \`IDX_20d0aac9050baa5a6ec674c277\` ON \`group_profiles\``);
        await queryRunner.query(`DROP TABLE \`group_profiles\``);
        await queryRunner.query(`DROP TABLE \`tests\``);
        await queryRunner.query(`DROP TABLE \`templates\``);
        await queryRunner.query(`DROP TABLE \`groups\``);
        await queryRunner.query(`DROP TABLE \`profile\``);
    }

}
