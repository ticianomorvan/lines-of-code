import { closeDatabase, generateTable, openDatabase } from "./database.ts";
import { printUserStatistics } from "./github.ts";

async function mainThread() {
  const database = openDatabase();
  generateTable(database);

  await printUserStatistics({
    databaseInstance: database,
    loggingLevel: "strict",
  });

  closeDatabase(database);
}

mainThread();
