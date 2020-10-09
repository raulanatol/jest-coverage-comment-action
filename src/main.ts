import { exec } from '@actions/exec';
import { context, getOctokit } from '@actions/github';
import { getInput, setFailed, warning } from '@actions/core';

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
  const octokit = getOctokit(getInput('github-token'));
  const issueNumber = context.payload.issue?.number;
  if (!issueNumber) {
    warning('Issue number not found. Impossible to create a comment');
    return;
  }

  await octokit.issues.createComment({
    repo: context.repo.repo,
    owner: context.repo.owner,
    body: comment,
    issue_number: issueNumber
  });
};

const generateCoverageSummary = async (): Promise<string> => {
  const jestCommand = getInput('jest-command');
  return exec(jestCommand).toString();
};

const start = async () => {
  const coverageSummary = await generateCoverageSummary();
  const percent = await getCoveragePercent();
  const comment = generateComment(percent, coverageSummary);
  await createComment(comment);
};

start().catch(error => {
  console.log('EEE', error);
  setFailed(error.message);
});
