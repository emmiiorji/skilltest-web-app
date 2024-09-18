import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAnswerType1726643535678 implements MigrationInterface {
    name = 'AddAnswerType1726643535678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`questions\` CHANGE \`answer_type\` \`answer_type\` enum ('textarea', 'radiobutton', 'multiinput', 'multiTextInput') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`questions\` CHANGE \`answer_type\` \`answer_type\` enum ('textarea', 'radiobutton', 'multiinput') NOT NULL`);
    }

}
