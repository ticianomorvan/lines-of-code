import consola from "consola";
import { Octokit } from "octokit";
import {
  type DatabaseInstance,
  getCommitStatsBySha,
  storeCommit,
} from "./database.ts";
import type { LoggingLevel, Repositories, RepositoryCommits } from "./types.ts";

const MAX_ITEMS_PER_PAGE = 100;

const octokit = new Octokit({ auth: Deno.env.get("GITHUB_API_TOKEN") });

const { data: user } = await octokit.rest.users.getAuthenticated();

async function getAuthenticatedUserRepositories(): Promise<Repositories> {
  const repositories: Repositories = [];
  let isDataPresent = true;
  let currentPage = 1;

  while (isDataPresent) {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      page: currentPage,
      per_page: MAX_ITEMS_PER_PAGE,
    });

    if (data.length === 0) {
      isDataPresent = false;
    } else {
      repositories.push(...data);
      currentPage += 1;
    }
  }

  return repositories;
}

export async function printUserStatistics({
  loggingLevel = "strict",
  databaseInstance,
}: {
  loggingLevel: LoggingLevel;
  databaseInstance: DatabaseInstance;
}) {
  let totalCommits = 0;
  let totalAdditions = 0;
  let totalDeletions = 0;
  let totalModifications = 0;

  const repositories = await getAuthenticatedUserRepositories();
  consola.info(`Fetched ${repositories.length} repositories.\n`);

  for (const repository of repositories) {
    consola.start(`Analyzing ${repository.full_name}...`);
    const commits: RepositoryCommits = [];
    let isDataPresent = true;
    let currentPage = 1;
    let additions = 0;
    let deletions = 0;
    let modifications = 0;

    while (isDataPresent) {
      const { data } = await octokit.rest.repos.listCommits({
        owner: repository.owner.login,
        repo: repository.name,
        page: currentPage,
        committer: user.login,
        per_page: MAX_ITEMS_PER_PAGE,
      });

      if (data.length === 0) {
        isDataPresent = false;
      } else {
        commits.push(...data);
        currentPage += 1;
      }
    }

    if (commits.length === 0) {
      consola.error(`You haven't contributed to ${repository.full_name}.`);

      continue;
    }

    consola.success(
      `Successfully fetched ${commits.length} commits which were authored by you.\n`,
    );

    consola.start("Getting commit stats...");

    for (const commit of commits) {
      const storedCommit = getCommitStatsBySha(databaseInstance, commit.sha);

      if (typeof storedCommit !== "undefined") {
        if (loggingLevel === "loose") {
          consola.success(`(${commit.sha}) stored!`);
        }

        additions += storedCommit.additions ?? 0;
        deletions += storedCommit.deletions ?? 0;
        modifications += storedCommit.total ?? 0;
      } else {
        if (loggingLevel === "loose") {
          consola.error(`(${commit.sha}) not stored.`);
        }

        const { data } = await octokit.rest.repos.getCommit({
          owner: repository.owner.login,
          repo: repository.name,
          ref: commit.sha,
        });

        additions += data.stats?.additions ?? 0;
        deletions += data.stats?.deletions ?? 0;
        modifications += data.stats?.total ?? 0;

        if (loggingLevel === "loose") {
          consola.info(
            `(${data.sha}) +${data.stats?.additions ?? 0} -${
              data.stats?.deletions ?? 0
            }, total: ${data.stats?.total ?? 0}`,
          );
        }

        storeCommit(databaseInstance, data, repository);
      }
    }

    totalCommits += commits.length;
    totalAdditions += additions;
    totalDeletions += deletions;
    totalModifications += modifications;

    consola.success(
      `You made ${additions} additions and ${deletions} deletions for a total of ${modifications} modifications into ${repository.full_name}.\n`,
    );
  }

  consola.success(
    `You've made ${totalCommits} commits across ${repositories.length} repositories, adding up ${totalAdditions} additions and ${totalDeletions} deletions, for a total of ${totalModifications} modifications.`,
  );
}
