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
            // Create basic answers table with only id column
            await queryRunner.query(`CREATE TABLE \`answers\` (\`id\` int NOT NULL AUTO_INCREMENT, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        }

        // Add columns to answers table conditionally
        const answersColumns = [
            { name: 'test_id', definition: 'int NOT NULL' },
            { name: 'question_id', definition: 'int NOT NULL' },
            { name: 'profile_id', definition: 'int NOT NULL' },
            { name: 'answer', definition: 'text NOT NULL' },
            { name: 'user_agent', definition: 'varchar(255) NOT NULL' },
            { name: 'ip', definition: 'varchar(45) NOT NULL' },
            { name: 'time_taken', definition: 'int NOT NULL' },
            { name: 'copy_count', definition: 'int NOT NULL' },
            { name: 'paste_count', definition: 'int NOT NULL' },
            { name: 'right_click_count', definition: 'int NOT NULL' },
            { name: 'inactive_time', definition: 'int NOT NULL' },
            { name: 'is_correct', definition: 'tinyint NULL' },
            { name: 'created_at', definition: 'datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)' },
            { name: 'updated_at', definition: 'datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)' }
        ];

        // Add columns to answers table conditionally (sequential for safety)
        for (const column of answersColumns) {
            const columnExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                AND table_name = 'answers'
                AND column_name = '${column.name}'
            `);

            if (columnExists[0].count === 0) {
                await queryRunner.query(`ALTER TABLE \`answers\` ADD COLUMN \`${column.name}\` ${column.definition}`);
            }
        }

        // Check if questions table exists before creating it
        const questionsTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'questions'
        `);

        if (questionsTableExists[0].count === 0) {
            // Create basic questions table with only id column
            await queryRunner.query(`CREATE TABLE \`questions\` (\`id\` int NOT NULL AUTO_INCREMENT, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        }

        // Add columns to questions table conditionally
        const questionsColumns = [
            { name: 'question', definition: 'text NOT NULL' },
            { name: 'answer_type', definition: "enum ('textarea', 'radiobutton', 'multiinput', 'multiTextInput') NOT NULL" },
            { name: 'answer_html', definition: 'text NOT NULL' },
            { name: 'correct', definition: 'text NOT NULL' },
            { name: 'created_at', definition: 'datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)' },
            { name: 'updated_at', definition: 'datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)' }
        ];

        // Add columns to questions table conditionally (sequential for safety)
        for (const column of questionsColumns) {
            const columnExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                AND table_name = 'questions'
                AND column_name = '${column.name}'
            `);

            if (columnExists[0].count === 0) {
                await queryRunner.query(`ALTER TABLE \`questions\` ADD COLUMN \`${column.name}\` ${column.definition}`);
            }
        }

        // Check if questions_tests table exists before creating it
        const questionsTestsTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'questions_tests'
        `);

        if (questionsTestsTableExists[0].count === 0) {
            // Create basic questions_tests table with composite primary key
            await queryRunner.query(`CREATE TABLE \`questions_tests\` (\`question_id\` int NOT NULL, \`test_id\` int NOT NULL, PRIMARY KEY (\`question_id\`, \`test_id\`)) ENGINE=InnoDB`);
        }

        // Add columns to questions_tests table conditionally
        const questionsTestsColumns = [
            { name: 'priority', definition: 'int NOT NULL' }
        ];

        for (const column of questionsTestsColumns) {
            const columnExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                AND table_name = 'questions_tests'
                AND column_name = '${column.name}'
            `);

            if (columnExists[0].count === 0) {
                await queryRunner.query(`ALTER TABLE \`questions_tests\` ADD COLUMN \`${column.name}\` ${column.definition}`);
            }
        }
        // Check if profiles table exists before altering it
        const profilesTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'profiles'
        `);

        if (profilesTableExists[0].count > 0) {
            await queryRunner.query(`ALTER TABLE \`profiles\` CHANGE \`createdAt\` \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
            await queryRunner.query(`ALTER TABLE \`profiles\` CHANGE \`updatedAt\` \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        }
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
        if (profilesTableExists[0].count > 0) {
            await queryRunner.query(`ALTER TABLE \`profiles\` CHANGE \`inProgress\` \`inProgress\` tinyint NULL`);
        }

        // Check if groups table exists before altering it
        const groupsTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'groups'
        `);

        if (groupsTableExists[0].count > 0) {
            await queryRunner.query(`ALTER TABLE \`groups\` CHANGE \`createdAt\` \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
            await queryRunner.query(`ALTER TABLE \`groups\` CHANGE \`updatedAt\` \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        }

        // Check if tests table exists before altering it
        const testsTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'tests'
        `);

        if (testsTableExists[0].count > 0) {
            await queryRunner.query(`ALTER TABLE \`tests\` CHANGE \`createdAt\` \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
            await queryRunner.query(`ALTER TABLE \`tests\` CHANGE \`updatedAt\` \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        }

        // Check if templates table exists before altering it
        const templatesTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'templates'
        `);

        if (templatesTableExists[0].count > 0) {
            await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`createdAt\` \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
            await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`updatedAt\` \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        }
        // Add foreign key constraints only if tables exist
        if (answersTableExists[0].count > 0) {
            // Check if foreign key constraints don't already exist
            const answersConstraints = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.table_constraints
                WHERE table_schema = DATABASE()
                AND table_name = 'answers'
                AND constraint_name IN ('FK_c97c3dbfeb59fadd93223afb85d', 'FK_677120094cf6d3f12df0b9dc5d3', 'FK_f5d7c43148a6a0d2eeef12e6056')
            `);

            if (answersConstraints[0].count === 0) {
                await queryRunner.query(`ALTER TABLE \`answers\` ADD CONSTRAINT \`FK_c97c3dbfeb59fadd93223afb85d\` FOREIGN KEY (\`test_id\`) REFERENCES \`tests\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
                await queryRunner.query(`ALTER TABLE \`answers\` ADD CONSTRAINT \`FK_677120094cf6d3f12df0b9dc5d3\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
                await queryRunner.query(`ALTER TABLE \`answers\` ADD CONSTRAINT \`FK_f5d7c43148a6a0d2eeef12e6056\` FOREIGN KEY (\`profile_id\`) REFERENCES \`profiles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
            }
        }

        if (questionsTestsTableExists[0].count > 0) {
            // Check if foreign key constraints don't already exist
            const questionsTestsConstraints = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.table_constraints
                WHERE table_schema = DATABASE()
                AND table_name = 'questions_tests'
                AND constraint_name IN ('FK_a8dc9ecb152703c2b43fa470efd', 'FK_9599e1d91fc95928e146dbdbb68')
            `);

            if (questionsTestsConstraints[0].count === 0) {
                await queryRunner.query(`ALTER TABLE \`questions_tests\` ADD CONSTRAINT \`FK_a8dc9ecb152703c2b43fa470efd\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
                await queryRunner.query(`ALTER TABLE \`questions_tests\` ADD CONSTRAINT \`FK_9599e1d91fc95928e146dbdbb68\` FOREIGN KEY (\`test_id\`) REFERENCES \`tests\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if questions_tests table exists before dropping foreign keys
        const questionsTestsTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'questions_tests'
        `);

        if (questionsTestsTableExists[0].count > 0) {
            // Check if foreign key constraints exist before dropping them
            const questionsTestsConstraints = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.table_constraints
                WHERE table_schema = DATABASE()
                AND table_name = 'questions_tests'
                AND constraint_name IN ('FK_9599e1d91fc95928e146dbdbb68', 'FK_a8dc9ecb152703c2b43fa470efd')
            `);

            if (questionsTestsConstraints[0].count > 0) {
                await queryRunner.query(`ALTER TABLE \`questions_tests\` DROP FOREIGN KEY \`FK_9599e1d91fc95928e146dbdbb68\``);
                await queryRunner.query(`ALTER TABLE \`questions_tests\` DROP FOREIGN KEY \`FK_a8dc9ecb152703c2b43fa470efd\``);
            }
        }

        // Check if answers table exists before dropping foreign keys
        const answersTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'answers'
        `);

        if (answersTableExists[0].count > 0) {
            // Check if foreign key constraints exist before dropping them
            const answersConstraints = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.table_constraints
                WHERE table_schema = DATABASE()
                AND table_name = 'answers'
                AND constraint_name IN ('FK_f5d7c43148a6a0d2eeef12e6056', 'FK_677120094cf6d3f12df0b9dc5d3', 'FK_c97c3dbfeb59fadd93223afb85d')
            `);

            if (answersConstraints[0].count > 0) {
                await queryRunner.query(`ALTER TABLE \`answers\` DROP FOREIGN KEY \`FK_f5d7c43148a6a0d2eeef12e6056\``);
                await queryRunner.query(`ALTER TABLE \`answers\` DROP FOREIGN KEY \`FK_677120094cf6d3f12df0b9dc5d3\``);
                await queryRunner.query(`ALTER TABLE \`answers\` DROP FOREIGN KEY \`FK_c97c3dbfeb59fadd93223afb85d\``);
            }
        }
        // Check if templates table exists before altering it
        const templatesTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'templates'
        `);

        if (templatesTableExists[0].count > 0) {
            await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`updatedAt\` \`updatedAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
            await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`createdAt\` \`createdAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        }

        // Check if tests table exists before altering it
        const testsTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'tests'
        `);

        if (testsTableExists[0].count > 0) {
            await queryRunner.query(`ALTER TABLE \`tests\` CHANGE \`updatedAt\` \`updatedAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
            await queryRunner.query(`ALTER TABLE \`tests\` CHANGE \`createdAt\` \`createdAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        }

        // Check if groups table exists before altering it
        const groupsTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'groups'
        `);

        if (groupsTableExists[0].count > 0) {
            await queryRunner.query(`ALTER TABLE \`groups\` CHANGE \`updatedAt\` \`updatedAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
            await queryRunner.query(`ALTER TABLE \`groups\` CHANGE \`createdAt\` \`createdAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        }

        // Check if profiles table exists before altering it
        const profilesTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'profiles'
        `);

        if (profilesTableExists[0].count > 0) {
            await queryRunner.query(`ALTER TABLE \`profiles\` CHANGE \`inProgress\` \`inProgress\` tinyint(1) NULL`);

            // Check if index exists before dropping it
            const indexExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.statistics
                WHERE table_schema = DATABASE()
                AND table_name = 'profiles'
                AND index_name = 'IDX_629be5336319558dc34e55d8ab'
            `);

            if (indexExists[0].count > 0) {
                await queryRunner.query(`ALTER TABLE \`profiles\` DROP INDEX \`IDX_629be5336319558dc34e55d8ab\``);
            }

            await queryRunner.query(`ALTER TABLE \`profiles\` CHANGE \`updatedAt\` \`updatedAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
            await queryRunner.query(`ALTER TABLE \`profiles\` CHANGE \`createdAt\` \`createdAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        }
        // Remove columns from answers table conditionally before dropping table
        if (answersTableExists[0].count > 0) {
            const answersColumnsToRemove = [
                'updated_at', 'created_at', 'is_correct', 'inactive_time', 'right_click_count',
                'paste_count', 'copy_count', 'time_taken', 'ip', 'user_agent', 'answer',
                'profile_id', 'question_id', 'test_id'
            ];

            for (const columnName of answersColumnsToRemove) {
                const columnExists = await queryRunner.query(`
                    SELECT COUNT(*) as count
                    FROM information_schema.columns
                    WHERE table_schema = DATABASE()
                    AND table_name = 'answers'
                    AND column_name = '${columnName}'
                `);

                if (columnExists[0].count > 0) {
                    await queryRunner.query(`ALTER TABLE \`answers\` DROP COLUMN \`${columnName}\``);
                }
            }

            // Drop the table after removing all columns except id
            await queryRunner.query(`DROP TABLE \`answers\``);
        }

        // Remove columns from questions table conditionally before dropping table
        const questionsTableExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'questions'
        `);

        if (questionsTableExists[0].count > 0) {
            const questionsColumnsToRemove = [
                'updated_at', 'created_at', 'correct', 'answer_html', 'answer_type', 'question'
            ];

            for (const columnName of questionsColumnsToRemove) {
                const columnExists = await queryRunner.query(`
                    SELECT COUNT(*) as count
                    FROM information_schema.columns
                    WHERE table_schema = DATABASE()
                    AND table_name = 'questions'
                    AND column_name = '${columnName}'
                `);

                if (columnExists[0].count > 0) {
                    await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`${columnName}\``);
                }
            }

            // Drop the table after removing all columns except id
            await queryRunner.query(`DROP TABLE \`questions\``);
        }

        // Remove columns from questions_tests table conditionally before dropping table
        if (questionsTestsTableExists[0].count > 0) {
            const questionsTestsColumnsToRemove = ['priority'];

            for (const columnName of questionsTestsColumnsToRemove) {
                const columnExists = await queryRunner.query(`
                    SELECT COUNT(*) as count
                    FROM information_schema.columns
                    WHERE table_schema = DATABASE()
                    AND table_name = 'questions_tests'
                    AND column_name = '${columnName}'
                `);

                if (columnExists[0].count > 0) {
                    await queryRunner.query(`ALTER TABLE \`questions_tests\` DROP COLUMN \`${columnName}\``);
                }
            }

            // Drop the table after removing all additional columns
            await queryRunner.query(`DROP TABLE \`questions_tests\``);
        }

        // Create unique index only if it doesn't exist and profiles table exists
        if (profilesTableExists[0].count > 0) {
            const linkIndexExists = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.statistics
                WHERE table_schema = DATABASE()
                AND table_name = 'profiles'
                AND index_name = 'link'
            `);

            if (linkIndexExists[0].count === 0) {
                await queryRunner.query(`CREATE UNIQUE INDEX \`link\` ON \`profiles\` (\`link\`)`);
            }
        }
    }

}
