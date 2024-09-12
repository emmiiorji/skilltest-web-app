import { AppDataSource } from "../connection";
import { Test } from "../entities/Test.entity";

export async function seedTests() {
  const testRepository = AppDataSource.getRepository(Test);

  const tests = [
    { name: "JavaScript Fundamentals Test" },
    { name: "Advanced JavaScript Concepts" },
    { name: "Frontend Framework Proficiency" },
    { name: "Node.js and Backend Development" },
    { name: "Data Structures and Algorithms in JS" },
  ];

  for (const testData of tests) {
    const test = testRepository.create(testData);
    await testRepository.save(test);
  }

  console.info("Test records seeded successfully");
}