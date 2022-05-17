<div align="center">
    <h1>jest-coverage-comment-action</h1>
</div>

<p>Comments a PR with the coverage (jest)</p>

![message](./docs/message.png)

---

# Inputs

## `github-token`

**Required** The github token to comment in the PR.

## `jest-command`

**Optional** The command used to generate the coverage. Default: `npx jest --coverage`

## `only-changes`

**Optional** Add parameter to show the coverage only for the changed files. Default: `true`

## `working-directory`

**Optional** The command used to generate the coverage. Default: `''`

## `delete-previous`

**Optional** Delete previous comments before adding a new one. Default: `true`

## `use-existing-reports`

**Optional** If already exists a coverage report the action uses it and doesn't run tests again. Default: `false`

# Example of usage

```yaml
uses: raulanatol/jest-coverage-comment-action@main
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
```

# Example using a custom jest command and working directory

**.github/workflows/main.yml**

```yaml
on: pull_request

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Hello world action step
        id: hello
        uses: raulanatol/jest-coverage-comment-action@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          jest-command: 'npm run jest-ci'
          working-directory: 'packages/my-package'
```

# Development

## Close release

To close a release you only need to execute the makefile with `release_{major|minor|patch}`

Example:

```shell script
make release_minor
```
