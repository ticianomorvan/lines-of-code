import { closeDatabase, openDatabase } from "./database.ts";
import { printUserStatistics } from "./github.ts";

async function mainThread() {
  const database = openDatabase();
  await printUserStatistics({ loggingLevel: "loose" });
  closeDatabase(database);
}

mainThread();
