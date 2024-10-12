import { type Endpoints } from "@octokit/types";

export type Repositories = Endpoints["GET /user/repos"]["response"]["data"];

export type RepositoryCommits =
  Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]["data"];

export type RepositoryCommit =
  Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]["data"][0];

export type CommitStats =
  Endpoints["GET /repos/{owner}/{repo}/commits/{ref}"]["response"]["data"][
    "stats"
  ];

export type LoggingLevel = "strict" | "loose";

export interface UserStatistics {
  totalAdditions: number;
  totalDeletions: number;
  totalModifications: number;
}
