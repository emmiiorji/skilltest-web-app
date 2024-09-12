import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1726138880327 implements MigrationInterface {
    name = 'InitialMigration1726138880327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`profile\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`link\` varchar(255) NULL, \`url\` varchar(255) NULL, \`name\` varchar(255) NOT NULL, \`country\` varchar(255) NULL, \`title\` varchar(255) NULL, \`description\` text NULL, \`lastActivity\` datetime NULL, \`earned\` decimal(10,2) NULL, \`rate\` decimal(5,2) NULL, \`totalHours\` int NULL, \`inProgress\` tinyint NULL, \`invitedAt\` datetime NULL, \`shortname\` varchar(100) NULL, \`recno\` int NULL, \`agencies\` text NULL, \`totalRevenue\` decimal(10,2) NULL, \`memberSince\` datetime NULL, \`vanityUrl\` varchar(255) NULL, \`skills\` text NULL, \`process\` text NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`groups\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tests\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`templates\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`template\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`answers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`answer\` text NOT NULL, \`user_agent\` varchar(255) NOT NULL, \`ip\` varchar(45) NOT NULL, \`copypaste\` enum ('copy', 'paste', 'right click') NULL, \`inactive\` tinyint NOT NULL DEFAULT 0, \`is_correct\` tinyint NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`test_id\` int NULL, \`question_id\` int NULL, \`profile_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`questions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`question\` text NOT NULL, \`answer_type\` enum ('textarea', 'radiobutton', 'multiinput') NOT NULL, \`answer_html\` text NOT NULL, \`correct\` text NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`profile_groups_groups\` (\`profileId\` int NOT NULL, \`groupsId\` int NOT NULL, INDEX \`IDX_67b4289d33fe7ce9806d8551d4\` (\`profileId\`), INDEX \`IDX_4df93905b485160ed727205cbe\` (\`groupsId\`), PRIMARY KEY (\`profileId\`, \`groupsId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tests_profiles\` (\`testsId\` int NOT NULL, \`profileId\` int NOT NULL, INDEX \`IDX_3447eea96a1654cc257656b33f\` (\`testsId\`), INDEX \`IDX_391cab40370a0a8532b908dddf\` (\`profileId\`), PRIMARY KEY (\`testsId\`, \`profileId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tests_groups\` (\`testsId\` int NOT NULL, \`groupsId\` int NOT NULL, INDEX \`IDX_60d5c7720cab52d359c14ee351\` (\`testsId\`), INDEX \`IDX_19286afc7f75d5ef6283eb8422\` (\`groupsId\`), PRIMARY KEY (\`testsId\`, \`groupsId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`answers\` ADD CONSTRAINT \`FK_c97c3dbfeb59fadd93223afb85d\` FOREIGN KEY (\`test_id\`) REFERENCES \`tests\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`answers\` ADD CONSTRAINT \`FK_677120094cf6d3f12df0b9dc5d3\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`answers\` ADD CONSTRAINT \`FK_f5d7c43148a6a0d2eeef12e6056\` FOREIGN KEY (\`profile_id\`) REFERENCES \`profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`profile_groups_groups\` ADD CONSTRAINT \`FK_67b4289d33fe7ce9806d8551d4a\` FOREIGN KEY (\`profileId\`) REFERENCES \`profile\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`profile_groups_groups\` ADD CONSTRAINT \`FK_4df93905b485160ed727205cbe3\` FOREIGN KEY (\`groupsId\`) REFERENCES \`groups\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tests_profiles\` ADD CONSTRAINT \`FK_3447eea96a1654cc257656b33fd\` FOREIGN KEY (\`testsId\`) REFERENCES \`tests\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tests_profiles\` ADD CONSTRAINT \`FK_391cab40370a0a8532b908dddf2\` FOREIGN KEY (\`profileId\`) REFERENCES \`profile\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tests_groups\` ADD CONSTRAINT \`FK_60d5c7720cab52d359c14ee3510\` FOREIGN KEY (\`testsId\`) REFERENCES \`tests\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tests_groups\` ADD CONSTRAINT \`FK_19286afc7f75d5ef6283eb8422a\` FOREIGN KEY (\`groupsId\`) REFERENCES \`groups\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tests_groups\` DROP FOREIGN KEY \`FK_19286afc7f75d5ef6283eb8422a\``);
        await queryRunner.query(`ALTER TABLE \`tests_groups\` DROP FOREIGN KEY \`FK_60d5c7720cab52d359c14ee3510\``);
        await queryRunner.query(`ALTER TABLE \`tests_profiles\` DROP FOREIGN KEY \`FK_391cab40370a0a8532b908dddf2\``);
        await queryRunner.query(`ALTER TABLE \`tests_profiles\` DROP FOREIGN KEY \`FK_3447eea96a1654cc257656b33fd\``);
        await queryRunner.query(`ALTER TABLE \`profile_groups_groups\` DROP FOREIGN KEY \`FK_4df93905b485160ed727205cbe3\``);
        await queryRunner.query(`ALTER TABLE \`profile_groups_groups\` DROP FOREIGN KEY \`FK_67b4289d33fe7ce9806d8551d4a\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP FOREIGN KEY \`FK_f5d7c43148a6a0d2eeef12e6056\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP FOREIGN KEY \`FK_677120094cf6d3f12df0b9dc5d3\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP FOREIGN KEY \`FK_c97c3dbfeb59fadd93223afb85d\``);
        await queryRunner.query(`DROP INDEX \`IDX_19286afc7f75d5ef6283eb8422\` ON \`tests_groups\``);
        await queryRunner.query(`DROP INDEX \`IDX_60d5c7720cab52d359c14ee351\` ON \`tests_groups\``);
        await queryRunner.query(`DROP TABLE \`tests_groups\``);
        await queryRunner.query(`DROP INDEX \`IDX_391cab40370a0a8532b908dddf\` ON \`tests_profiles\``);
        await queryRunner.query(`DROP INDEX \`IDX_3447eea96a1654cc257656b33f\` ON \`tests_profiles\``);
        await queryRunner.query(`DROP TABLE \`tests_profiles\``);
        await queryRunner.query(`DROP INDEX \`IDX_4df93905b485160ed727205cbe\` ON \`profile_groups_groups\``);
        await queryRunner.query(`DROP INDEX \`IDX_67b4289d33fe7ce9806d8551d4\` ON \`profile_groups_groups\``);
        await queryRunner.query(`DROP TABLE \`profile_groups_groups\``);
        await queryRunner.query(`DROP TABLE \`questions\``);
        await queryRunner.query(`DROP TABLE \`answers\``);
        await queryRunner.query(`DROP TABLE \`templates\``);
        await queryRunner.query(`DROP TABLE \`tests\``);
        await queryRunner.query(`DROP TABLE \`groups\``);
        await queryRunner.query(`DROP TABLE \`profile\``);
    }

}
