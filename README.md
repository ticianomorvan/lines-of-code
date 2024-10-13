# Lines of Code

Rewrite of an old project [ticianomorvan/lines-of-gode](https://github.com/ticianomorvan/lines-of-gode) in TypeScript using Deno runtime.

It authenticates a user with a GitHub API token (see `.env.template`) and fetches all repositories they have access to. Then, fetches each commit created by the user in those repositories and calculates additions, deletions and total modifications. Once each commit was fetched, it produces a per-repository total and then a global total.

To improve performance on subsequent runs, we use `sqlite` to store already-fetched commits. This reduces drastically the amount of API requests.

## Start

Make sure you've installed the Deno runtime and `sqlite`!

1. Populate a `.env` file with your GitHub API token (you can clone `.env.file`).
2. Run `deno install` to install dependencies.
3. Run `deno task start` to start fetching your statistics.

## Bugs and errors

This is a hobby/practice project, but I really like it, so be free to copy, re-use or open a PR to solve any problem you encounter.
