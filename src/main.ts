import core from '@actions/core';
import { exec } from '@actions/exec';
import { context, getOctokit } from '@actions/github';

const getCoveragePercent = async (): Promise<number> => {
  const percent = await exec('npx coverage-percentage ./coverage/lcov.info --lcov').toString();
  return Number(percent);
};

const generateComment = (percent: number, summary: string): string =>
  `<p>Total Coverage: <code>${percent}</code></p>
   <details><summary>Coverage report</summary>
    <p>${summary}</p>
   </details>`;

const createComment = async (comment: string) => {
  const octokit = getOctokit(core.getInput('github-token'));
  await octokit.issues.createComment({
    repo: context.repo.repo,
    owner: context.repo.owner,
    body: comment,
    issue_number: context.payload.number
  });
};

const generateCoverageSummary = async (): Promise<string> => {
  const jestCommand = core.getInput('jest-command');
  return exec(jestCommand).toString();
};

const start = async () => {
  const coverageSummary = await generateCoverageSummary();
  const percent = await getCoveragePercent();
  const comment = generateComment(percent, coverageSummary);
  await createComment(comment);
};

start().catch(error => {
  core.setFailed(error.message);
});
