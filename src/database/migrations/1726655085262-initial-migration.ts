import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1726655085262 implements MigrationInterface {
    name = 'InitialMigration1726655085262'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`profiles_groups\` (\`profileId\` int NOT NULL, \`groupId\` int NOT NULL, INDEX \`IDX_536cca102bd5ef9f2be781d90c\` (\`profileId\`), INDEX \`IDX_89bc9bdd21ddd7e8bb160de163\` (\`groupId\`), PRIMARY KEY (\`profileId\`, \`groupId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tests_profiles\` (\`testId\` int NOT NULL, \`profileId\` int NOT NULL, INDEX \`IDX_7a1140d1305170d722dce3db2e\` (\`testId\`), INDEX \`IDX_391cab40370a0a8532b908dddf\` (\`profileId\`), PRIMARY KEY (\`testId\`, \`profileId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tests_groups\` (\`testId\` int NOT NULL, \`groupId\` int NOT NULL, INDEX \`IDX_9413a2a7e0e2a7b3ba48ba3130\` (\`testId\`), INDEX \`IDX_fe025b9206a723938c35d70f1b\` (\`groupId\`), PRIMARY KEY (\`testId\`, \`groupId\`)) ENGINE=InnoDB`);
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
        await queryRunner.query(`DROP INDEX \`IDX_fe025b9206a723938c35d70f1b\` ON \`tests_groups\``);
        await queryRunner.query(`DROP INDEX \`IDX_9413a2a7e0e2a7b3ba48ba3130\` ON \`tests_groups\``);
        await queryRunner.query(`DROP TABLE \`tests_groups\``);
        await queryRunner.query(`DROP INDEX \`IDX_391cab40370a0a8532b908dddf\` ON \`tests_profiles\``);
        await queryRunner.query(`DROP INDEX \`IDX_7a1140d1305170d722dce3db2e\` ON \`tests_profiles\``);
        await queryRunner.query(`DROP TABLE \`tests_profiles\``);
        await queryRunner.query(`DROP INDEX \`IDX_89bc9bdd21ddd7e8bb160de163\` ON \`profiles_groups\``);
        await queryRunner.query(`DROP INDEX \`IDX_536cca102bd5ef9f2be781d90c\` ON \`profiles_groups\``);
        await queryRunner.query(`DROP TABLE \`profiles_groups\``);
    }

}
