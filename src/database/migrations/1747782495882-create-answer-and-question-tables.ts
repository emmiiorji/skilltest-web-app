import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAnswerAndQuestionTables1747782495882 implements MigrationInterface {
    name = 'CreateAnswerAndQuestionTables1747782495882'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the index exists before dropping it
        const indexExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
            AND table_name = 'profiles'
            AND index_name = 'link'
        `);

        if (indexExists[0].count > 0) {
            await queryRunner.query(`DROP INDEX \`link\` ON \`profiles\``);
        }
        // Check if answers table exists before creating it
        const answersTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'answers'
        `);

        if (answersTableExists[0].count === 0) {
            await queryRunner.query(`CREATE TABLE \`answers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`test_id\` int NOT NULL, \`question_id\` int NOT NULL, \`profile_id\` int NOT NULL, \`answer\` text NOT NULL, \`user_agent\` varchar(255) NOT NULL, \`ip\` varchar(45) NOT NULL, \`time_taken\` int NOT NULL, \`copy_count\` int NOT NULL, \`paste_count\` int NOT NULL, \`right_click_count\` int NOT NULL, \`inactive_time\` int NOT NULL, \`is_correct\` tinyint NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        }

        // Check if questions table exists before creating it
        const questionsTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'questions'
        `);

        if (questionsTableExists[0].count === 0) {
            await queryRunner.query(`CREATE TABLE \`questions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`question\` text NOT NULL, \`answer_type\` enum ('textarea', 'radiobutton', 'multiinput', 'multiTextInput') NOT NULL, \`answer_html\` text NOT NULL, \`correct\` text NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        }

        // Check if questions_tests table exists before creating it
        const questionsTestsTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'questions_tests'
        `);

        if (questionsTestsTableExists[0].count === 0) {
            await queryRunner.query(`CREATE TABLE \`questions_tests\` (\`question_id\` int NOT NULL, \`test_id\` int NOT NULL, \`priority\` int NOT NULL, PRIMARY KEY (\`question_id\`, \`test_id\`)) ENGINE=InnoDB`);
        }
        await queryRunner.query(`ALTER TABLE \`profiles\` CHANGE \`createdAt\` \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`profiles\` CHANGE \`updatedAt\` \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        // Check if the unique index already exists before creating it
        const uniqueIndexExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
            AND table_name = 'profiles'
            AND index_name = 'IDX_629be5336319558dc34e55d8ab'
        `);

        if (uniqueIndexExists[0].count === 0) {
            await queryRunner.query(`ALTER TABLE \`profiles\` ADD UNIQUE INDEX \`IDX_629be5336319558dc34e55d8ab\` (\`link\`)`);
        }
        await queryRunner.query(`ALTER TABLE \`profiles\` CHANGE \`inProgress\` \`inProgress\` tinyint NULL`);
        await queryRunner.query(`ALTER TABLE \`groups\` CHANGE \`createdAt\` \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`groups\` CHANGE \`updatedAt\` \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`tests\` CHANGE \`createdAt\` \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`tests\` CHANGE \`updatedAt\` \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`createdAt\` \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`updatedAt\` \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`answers\` ADD CONSTRAINT \`FK_c97c3dbfeb59fadd93223afb85d\` FOREIGN KEY (\`test_id\`) REFERENCES \`tests\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`answers\` ADD CONSTRAINT \`FK_677120094cf6d3f12df0b9dc5d3\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`answers\` ADD CONSTRAINT \`FK_f5d7c43148a6a0d2eeef12e6056\` FOREIGN KEY (\`profile_id\`) REFERENCES \`profiles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` ADD CONSTRAINT \`FK_a8dc9ecb152703c2b43fa470efd\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` ADD CONSTRAINT \`FK_9599e1d91fc95928e146dbdbb68\` FOREIGN KEY (\`test_id\`) REFERENCES \`tests\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`questions_tests\` DROP FOREIGN KEY \`FK_9599e1d91fc95928e146dbdbb68\``);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` DROP FOREIGN KEY \`FK_a8dc9ecb152703c2b43fa470efd\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP FOREIGN KEY \`FK_f5d7c43148a6a0d2eeef12e6056\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP FOREIGN KEY \`FK_677120094cf6d3f12df0b9dc5d3\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP FOREIGN KEY \`FK_c97c3dbfeb59fadd93223afb85d\``);
        await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`updatedAt\` \`updatedAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`createdAt\` \`createdAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`tests\` CHANGE \`updatedAt\` \`updatedAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`tests\` CHANGE \`createdAt\` \`createdAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`groups\` CHANGE \`updatedAt\` \`updatedAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`groups\` CHANGE \`createdAt\` \`createdAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`profiles\` CHANGE \`inProgress\` \`inProgress\` tinyint(1) NULL`);
        await queryRunner.query(`ALTER TABLE \`profiles\` DROP INDEX \`IDX_629be5336319558dc34e55d8ab\``);
        await queryRunner.query(`ALTER TABLE \`profiles\` CHANGE \`updatedAt\` \`updatedAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`profiles\` CHANGE \`createdAt\` \`createdAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`DROP TABLE \`questions_tests\``);
        await queryRunner.query(`DROP TABLE \`questions\``);
        await queryRunner.query(`DROP TABLE \`answers\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`link\` ON \`profiles\` (\`link\`)`);
    }

}
