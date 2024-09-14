import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuestionTestsEntity1726320637031 implements MigrationInterface {
    name = 'AddQuestionTestsEntity1726320637031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`questions_tests\` ADD PRIMARY KEY (\`question_id\`, \`test_id\`)`);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` CHANGE \`question_id\` \`question_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` CHANGE \`test_id\` \`test_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` CHANGE \`priority\` \`priority\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` ADD CONSTRAINT \`FK_a8dc9ecb152703c2b43fa470efd\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` ADD CONSTRAINT \`FK_9599e1d91fc95928e146dbdbb68\` FOREIGN KEY (\`test_id\`) REFERENCES \`tests\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`questions_tests\` DROP FOREIGN KEY \`FK_9599e1d91fc95928e146dbdbb68\``);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` DROP FOREIGN KEY \`FK_a8dc9ecb152703c2b43fa470efd\``);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` CHANGE \`priority\` \`priority\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` CHANGE \`test_id\` \`test_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` CHANGE \`question_id\` \`question_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`questions_tests\` DROP PRIMARY KEY`);
    }

}
