import { AppDataSource } from "../connection";
import { seedQuestions } from "./questionSeed";
import { seedTemplates } from "./templateSeed";
import { seedTests } from "./testSeed";

async function seedDatabase() {
  try {
    await AppDataSource.initialize();
    await seedQuestions();
    await seedTemplates();
    await seedTests();
    console.info("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

seedDatabase().catch((error) => {
  console.error("Error in seed script:", error);
  process.exit(1);
});