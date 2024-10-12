import { Database } from "@db/sqlite";
import type { CommitStats, RepositoryCommit } from "./types.ts";

export type DatabaseInstance = InstanceType<typeof Database>;

export function openDatabase(): DatabaseInstance {
  const instance = new Database("commits.db");

  return instance;
}

export function closeDatabase(instance: DatabaseInstance) {
  instance.close();
}

export function generateTable(instance: DatabaseInstance) {
  const statement = instance.prepare(`
    CREATE TABLE IF NOT EXISTS commits (
      id VARCHAR(40) PRIMARY KEY,
      repository TEXT,
      additions INTEGER,
      deletions INTEGER,
      total INTEGER
    );
  `);

  statement.run();
}

export function getCommitStatsBySha(
  instance: DatabaseInstance,
  sha: string,
): CommitStats {
  const statement = instance.prepare(`
    SELECT additions, deletions, total FROM commits WHERE id == "${sha}";
  `);

  const [additions, deletions, total] = statement.value<
    [number, number, number]
  >()!;

  return { additions, deletions, total };
}

export function storeCommit(
  instance: DatabaseInstance,
  commit: RepositoryCommit,
) {}
