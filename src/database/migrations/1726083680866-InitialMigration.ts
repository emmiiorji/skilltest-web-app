import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1726083680866 implements MigrationInterface {
    name = 'InitialMigration1726083680866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`tests\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`groups\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`profile\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`link\` varchar(255) NULL, \`url\` varchar(255) NULL, \`name\` varchar(255) NOT NULL, \`country\` varchar(255) NULL, \`title\` varchar(255) NULL, \`description\` text NULL, \`lastActivity\` datetime NULL, \`earned\` decimal(10,2) NULL, \`rate\` decimal(5,2) NULL, \`totalHours\` int NULL, \`inProgress\` tinyint NULL, \`invitedAt\` datetime NULL, \`shortname\` varchar(100) NULL, \`recno\` int NULL, \`agencies\` text NULL, \`totalRevenue\` decimal(10,2) NULL, \`memberSince\` datetime NULL, \`vanityUrl\` varchar(255) NULL, \`skills\` text NULL, \`process\` text NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`templates\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`template\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`group_tests\` (\`groupsId\` int NOT NULL, \`testsId\` int NOT NULL, INDEX \`IDX_9b9adfb857e7c4548ee950422c\` (\`groupsId\`), INDEX \`IDX_1ef57607663bb9714fd9ea6830\` (\`testsId\`), PRIMARY KEY (\`groupsId\`, \`testsId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`group_profiles\` (\`groupsId\` int NOT NULL, \`profileId\` int NOT NULL, INDEX \`IDX_20d0aac9050baa5a6ec674c277\` (\`groupsId\`), INDEX \`IDX_ad85197d868d5082bb27b449aa\` (\`profileId\`), PRIMARY KEY (\`groupsId\`, \`profileId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`profile_test\` (\`profileId\` int NOT NULL, \`testsId\` int NOT NULL, INDEX \`IDX_9d72579b44675a4101888137ab\` (\`profileId\`), INDEX \`IDX_349b8a5583be08e0f7c19aa26f\` (\`testsId\`), PRIMARY KEY (\`profileId\`, \`testsId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`group_tests\` ADD CONSTRAINT \`FK_9b9adfb857e7c4548ee950422c7\` FOREIGN KEY (\`groupsId\`) REFERENCES \`groups\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`group_tests\` ADD CONSTRAINT \`FK_1ef57607663bb9714fd9ea68308\` FOREIGN KEY (\`testsId\`) REFERENCES \`tests\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`group_profiles\` ADD CONSTRAINT \`FK_20d0aac9050baa5a6ec674c2775\` FOREIGN KEY (\`groupsId\`) REFERENCES \`groups\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`group_profiles\` ADD CONSTRAINT \`FK_ad85197d868d5082bb27b449aac\` FOREIGN KEY (\`profileId\`) REFERENCES \`profile\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`profile_test\` ADD CONSTRAINT \`FK_9d72579b44675a4101888137abd\` FOREIGN KEY (\`profileId\`) REFERENCES \`profile\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`profile_test\` ADD CONSTRAINT \`FK_349b8a5583be08e0f7c19aa26f5\` FOREIGN KEY (\`testsId\`) REFERENCES \`tests\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`profile_test\` DROP FOREIGN KEY \`FK_349b8a5583be08e0f7c19aa26f5\``);
        await queryRunner.query(`ALTER TABLE \`profile_test\` DROP FOREIGN KEY \`FK_9d72579b44675a4101888137abd\``);
        await queryRunner.query(`ALTER TABLE \`group_profiles\` DROP FOREIGN KEY \`FK_ad85197d868d5082bb27b449aac\``);
        await queryRunner.query(`ALTER TABLE \`group_profiles\` DROP FOREIGN KEY \`FK_20d0aac9050baa5a6ec674c2775\``);
        await queryRunner.query(`ALTER TABLE \`group_tests\` DROP FOREIGN KEY \`FK_1ef57607663bb9714fd9ea68308\``);
        await queryRunner.query(`ALTER TABLE \`group_tests\` DROP FOREIGN KEY \`FK_9b9adfb857e7c4548ee950422c7\``);
        await queryRunner.query(`DROP INDEX \`IDX_349b8a5583be08e0f7c19aa26f\` ON \`profile_test\``);
        await queryRunner.query(`DROP INDEX \`IDX_9d72579b44675a4101888137ab\` ON \`profile_test\``);
        await queryRunner.query(`DROP TABLE \`profile_test\``);
        await queryRunner.query(`DROP INDEX \`IDX_ad85197d868d5082bb27b449aa\` ON \`group_profiles\``);
        await queryRunner.query(`DROP INDEX \`IDX_20d0aac9050baa5a6ec674c277\` ON \`group_profiles\``);
        await queryRunner.query(`DROP TABLE \`group_profiles\``);
        await queryRunner.query(`DROP INDEX \`IDX_1ef57607663bb9714fd9ea6830\` ON \`group_tests\``);
        await queryRunner.query(`DROP INDEX \`IDX_9b9adfb857e7c4548ee950422c\` ON \`group_tests\``);
        await queryRunner.query(`DROP TABLE \`group_tests\``);
        await queryRunner.query(`DROP TABLE \`templates\``);
        await queryRunner.query(`DROP TABLE \`profile\``);
        await queryRunner.query(`DROP TABLE \`groups\``);
        await queryRunner.query(`DROP TABLE \`tests\``);
    }

}
