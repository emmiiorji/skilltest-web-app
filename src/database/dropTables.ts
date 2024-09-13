import { AppDataSource } from './connection';
// Import other entities as needed

async function dropTables() {
  try {
    await AppDataSource.initialize();
    
    // Get all entity metadata
    const entities = AppDataSource.entityMetadatas;
    
    for (const entity of entities) {
      const repository = AppDataSource.getRepository(entity.name);
      await repository.query(`DROP TABLE IF EXISTS ${entity.tableName}`);
      console.log(`Dropped table: ${entity.tableName}`);
    }
    
    console.log('All application tables have been dropped successfully.');
  } catch (error) {
    console.error('Error dropping tables:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

dropTables();