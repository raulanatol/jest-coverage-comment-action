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

## `measures-server-host`

**Optional** If define, enables sending mesaures feature to the defined host. Host URL is expected to retreive and send coverage measure via GET and POST.

GET expects: { date: Date, coverageMeasure: { percentage: number } }. Query param repository, indicating the repository name, is included in the URL.

POST will include in the body: { repository: string, coveragePercentage: number }

## `measures-server-auth-header-parameter`

**Optional** Header field for sending the auth-token to identify against the measures server. Default: `bearer`

## `measures-server-auth-token`

**Optional** Key to identify against the measures server. Shall be set as the value for the parameter defined in measures-server-auth-header-parameter

## `measures-server-cors-origin`

**Optional** Value to be set in origin header field in case the measures server has CORS enabled. If not the case, nothing needs to be set

## `measures-server-repository`

**Optional** Repository name to identify in the measures server. Example: backend, web, front, app, ...'

## `measures-server-main-branch`

**Optional** Identifies the branch from whom the measures are sent to the host. This will be the branch against the others will compare.  Default: `main`
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

# Example sending measures to a server
**.github/workflows/main.yml**

```yaml
name: Build
on: [pull_request, workflow_dispatch]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Coverage
        uses: raulanatol/jest-coverage-comment-action@main
        with:
          jest-command: yarn test-ci
          use-existing-reports: true
          github-token: ${{ secrets.GITHUB_TOKEN }}
          measures-server-host: 'https://49f0-81-61-118-50.eu.ngrok.io/v1/testing/report/measures'
          measures-server-auth-header-parameter: 'bearer'
          measures-server-auth-token: 'tokenDePrueba'
          measures-server-cors-origin: 'ttps://49f0-81-61-118-50.eu.ngrok.io'
          measures-server-repository: 'web'
          measures-server-main-branch: 'main'

```

# Development

## Close release

To close a release you only need to execute the makefile with `release_{major|minor|patch}`

Example:

```shell script
make release_minor
```
