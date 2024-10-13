import { Database } from "@db/sqlite";
import type { CommitStats, Repository, RepositoryCommit } from "./types.ts";

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
): CommitStats | undefined {
  const statement = instance.prepare(`
    SELECT additions, deletions, total FROM commits WHERE id = '${sha}';
  `);

  const result = statement.value<[number, number, number]>();

  if (!result) {
    return undefined;
  }

  const [additions, deletions, total] = result;

  return { additions, deletions, total };
}

export function storeCommit(
  instance: DatabaseInstance,
  commit: RepositoryCommit,
  repository: Repository,
) {
  const statement = instance.prepare(`
    INSERT INTO commits (id, repository, additions, deletions, total) VALUES ('${commit.sha}', '${repository.full_name}', ${commit.stats?.additions}, ${commit.stats?.deletions}, ${commit.stats?.total});
  `);

  statement.run();
}
