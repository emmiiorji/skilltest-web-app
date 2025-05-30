import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1748277581565 implements MigrationInterface {
    name = 'InitialMigration1748277581565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`links\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`tag_id\` int NULL, \`link\` varchar(1000) NULL, \`active\` tinyint NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tags\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`profile_tags\` (\`profile_id\` int NOT NULL, \`tag_id\` int NOT NULL, PRIMARY KEY (\`profile_id\`, \`tag_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`profile\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`link\` varchar(255) NOT NULL, \`url\` varchar(255) NULL, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NULL, \`country\` varchar(255) NULL, \`title\` varchar(255) NULL, \`description\` text NULL, \`lastActivity\` datetime NULL, \`earned\` decimal(10,2) NULL, \`rate\` decimal(5,2) NULL, \`totalHours\` int NULL, \`inProgress\` tinyint NULL, \`invitedAt\` datetime NULL, \`shortname\` varchar(100) NULL, \`recno\` int NULL, \`agencies\` text NULL, \`totalRevenue\` decimal(10,2) NULL, \`memberSince\` datetime NULL, \`vanityUrl\` varchar(255) NULL, \`skills\` text NULL, \`process\` text NULL, UNIQUE INDEX \`IDX_06bd69d723b1cdda96abfe88a7\` (\`link\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`groups\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`answers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`test_id\` int NOT NULL, \`question_id\` int NOT NULL, \`profile_id\` int NOT NULL, \`answer\` text NOT NULL, \`user_agent\` varchar(255) NOT NULL, \`ip\` varchar(45) NOT NULL, \`time_taken\` int NOT NULL, \`copy_count\` int NOT NULL, \`paste_count\` int NOT NULL, \`right_click_count\` int NOT NULL, \`inactive_time\` int NOT NULL, \`is_correct\` tinyint NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`focus_lost_events\` json NOT NULL DEFAULT (JSON_ARRAY()), \`clipboard_events\` json NOT NULL DEFAULT (JSON_ARRAY()), \`pre_submit_delay\` float NOT NULL DEFAULT '0', \`answer_change_events\` json NOT NULL DEFAULT (JSON_ARRAY()), \`device_fingerprint\` json NOT NULL DEFAULT (JSON_OBJECT()), \`device_type\` varchar(10) NOT NULL DEFAULT 'desktop', \`time_to_first_interaction\` float NOT NULL DEFAULT '0', \`mouse_click_events\` json NOT NULL DEFAULT (JSON_ARRAY()), \`keyboard_press_events\` json NOT NULL DEFAULT (JSON_ARRAY()), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`questions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`question\` text NOT NULL, \`answer_type\` enum ('textarea', 'radiobutton', 'multiinput', 'multiTextInput') NOT NULL, \`answer_html\` text NOT NULL, \`correct\` text NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`questions_tests\` (\`question_id\` int NOT NULL, \`test_id\` int NOT NULL, \`priority\` int NOT NULL, PRIMARY KEY (\`question_id\`, \`test_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tests\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`tracking_config\` json NOT NULL DEFAULT (JSON_OBJECT()), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`queries\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`query\` varchar(1000) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`templates\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`template\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`profiles_groups\` (\`profileId\` int NOT NULL, \`groupId\` int NOT NULL, INDEX \`IDX_536cca102bd5ef9f2be781d90c\` (\`profileId\`), INDEX \`IDX_89bc9bdd21ddd7e8bb160de163\` (\`groupId\`), PRIMARY KEY (\`profileId\`, \`groupId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tests_profiles\` (\`testId\` int NOT NULL, \`profileId\` int NOT NULL, INDEX \`IDX_7a1140d1305170d722dce3db2e\` (\`testId\`), INDEX \`IDX_391cab40370a0a8532b908dddf\` (\`profileId\`), PRIMARY KEY (\`testId\`, \`profileId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tests_groups\` (\`testId\` int NOT NULL, \`groupId\` int NOT NULL, INDEX \`IDX_9413a2a7e0e2a7b3ba48ba3130\` (\`testId\`), INDEX \`IDX_fe025b9206a723938c35d70f1b\` (\`groupId\`), PRIMARY KEY (\`testId\`, \`groupId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`links\` ADD CONSTRAINT \`FK_50fb924b8150eb60e6287c99e61\` FOREIGN KEY (\`tag_id\`) REFERENCES \`tags\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`profile_tags\` ADD CONSTRAINT \`FK_badb116eb5063aeadd9a2d9b6db\` FOREIGN KEY (\`profile_id\`) REFERENCES \`profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`profile_tags\` ADD CONSTRAINT \`FK_abd812637001d08946f8c59288a\` FOREIGN KEY (\`tag_id\`) REFERENCES \`tags\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`answers\` ADD CONSTRAINT \`FK_c97c3dbfeb59fadd93223afb85d\` FOREIGN KEY (\`test_id\`) REFERENCES \`tests\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`answers\` ADD CONSTRAINT \`FK_677120094cf6d3f12df0b9dc5d3\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`answers\` ADD CONSTRAINT \`FK_f5d7c43148a6a0d2eeef12e6056\` FOREIGN KEY (\`profile_id\`) REFERENCES \`profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` ADD CONSTRAINT \`FK_a8dc9ecb152703c2b43fa470efd\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` ADD CONSTRAINT \`FK_9599e1d91fc95928e146dbdbb68\` FOREIGN KEY (\`test_id\`) REFERENCES \`tests\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`profiles_groups\` ADD CONSTRAINT \`FK_536cca102bd5ef9f2be781d90c0\` FOREIGN KEY (\`profileId\`) REFERENCES \`profile\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`profiles_groups\` ADD CONSTRAINT \`FK_89bc9bdd21ddd7e8bb160de1638\` FOREIGN KEY (\`groupId\`) REFERENCES \`groups\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tests_profiles\` ADD CONSTRAINT \`FK_7a1140d1305170d722dce3db2ea\` FOREIGN KEY (\`testId\`) REFERENCES \`tests\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tests_profiles\` ADD CONSTRAINT \`FK_391cab40370a0a8532b908dddf2\` FOREIGN KEY (\`profileId\`) REFERENCES \`profile\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tests_groups\` ADD CONSTRAINT \`FK_9413a2a7e0e2a7b3ba48ba3130b\` FOREIGN KEY (\`testId\`) REFERENCES \`tests\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`tests_groups\` ADD CONSTRAINT \`FK_fe025b9206a723938c35d70f1bb\` FOREIGN KEY (\`groupId\`) REFERENCES \`groups\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tests_groups\` DROP FOREIGN KEY \`FK_fe025b9206a723938c35d70f1bb\``);
        await queryRunner.query(`ALTER TABLE \`tests_groups\` DROP FOREIGN KEY \`FK_9413a2a7e0e2a7b3ba48ba3130b\``);
        await queryRunner.query(`ALTER TABLE \`tests_profiles\` DROP FOREIGN KEY \`FK_391cab40370a0a8532b908dddf2\``);
        await queryRunner.query(`ALTER TABLE \`tests_profiles\` DROP FOREIGN KEY \`FK_7a1140d1305170d722dce3db2ea\``);
        await queryRunner.query(`ALTER TABLE \`profiles_groups\` DROP FOREIGN KEY \`FK_89bc9bdd21ddd7e8bb160de1638\``);
        await queryRunner.query(`ALTER TABLE \`profiles_groups\` DROP FOREIGN KEY \`FK_536cca102bd5ef9f2be781d90c0\``);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` DROP FOREIGN KEY \`FK_9599e1d91fc95928e146dbdbb68\``);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` DROP FOREIGN KEY \`FK_a8dc9ecb152703c2b43fa470efd\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP FOREIGN KEY \`FK_f5d7c43148a6a0d2eeef12e6056\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP FOREIGN KEY \`FK_677120094cf6d3f12df0b9dc5d3\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP FOREIGN KEY \`FK_c97c3dbfeb59fadd93223afb85d\``);
        await queryRunner.query(`ALTER TABLE \`profile_tags\` DROP FOREIGN KEY \`FK_abd812637001d08946f8c59288a\``);
        await queryRunner.query(`ALTER TABLE \`profile_tags\` DROP FOREIGN KEY \`FK_badb116eb5063aeadd9a2d9b6db\``);
        await queryRunner.query(`ALTER TABLE \`links\` DROP FOREIGN KEY \`FK_50fb924b8150eb60e6287c99e61\``);
        await queryRunner.query(`DROP INDEX \`IDX_fe025b9206a723938c35d70f1b\` ON \`tests_groups\``);
        await queryRunner.query(`DROP INDEX \`IDX_9413a2a7e0e2a7b3ba48ba3130\` ON \`tests_groups\``);
        await queryRunner.query(`DROP TABLE \`tests_groups\``);
        await queryRunner.query(`DROP INDEX \`IDX_391cab40370a0a8532b908dddf\` ON \`tests_profiles\``);
        await queryRunner.query(`DROP INDEX \`IDX_7a1140d1305170d722dce3db2e\` ON \`tests_profiles\``);
        await queryRunner.query(`DROP TABLE \`tests_profiles\``);
        await queryRunner.query(`DROP INDEX \`IDX_89bc9bdd21ddd7e8bb160de163\` ON \`profiles_groups\``);
        await queryRunner.query(`DROP INDEX \`IDX_536cca102bd5ef9f2be781d90c\` ON \`profiles_groups\``);
        await queryRunner.query(`DROP TABLE \`profiles_groups\``);
        await queryRunner.query(`DROP TABLE \`templates\``);
        await queryRunner.query(`DROP TABLE \`queries\``);
        await queryRunner.query(`DROP TABLE \`tests\``);
        await queryRunner.query(`DROP TABLE \`questions_tests\``);
        await queryRunner.query(`DROP TABLE \`questions\``);
        await queryRunner.query(`DROP TABLE \`answers\``);
        await queryRunner.query(`DROP TABLE \`groups\``);
        await queryRunner.query(`DROP INDEX \`IDX_06bd69d723b1cdda96abfe88a7\` ON \`profile\``);
        await queryRunner.query(`DROP TABLE \`profile\``);
        await queryRunner.query(`DROP TABLE \`profile_tags\``);
        await queryRunner.query(`DROP TABLE \`tags\``);
        await queryRunner.query(`DROP TABLE \`links\``);
    }

}
