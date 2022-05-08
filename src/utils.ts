import { exec } from '@actions/exec';
import { context } from '@actions/github';
import { info, error, getInput, warning, InputOptions } from '@actions/core';
import { getRestClient } from './gitHubAPI';
import * as fs from 'fs';
import { RestEndpointMethods } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';
import { Measure } from './measures/measures.type';
import { getMeasures, sendMeasures } from './measures/measures';

// eslint-disable-next-line no-unused-vars
type CommandResultFormatter = (input: string[]) => string;

const findTableStart = (search: string, array: string[]) => {
  const index = array.findIndex((line: string) => line.startsWith(search), search);
  return (index > 0 ? index : 1);
};

export const stringFormatter: CommandResultFormatter = (input: string[]) =>
  input.join('\n');

export const summaryFormatter: CommandResultFormatter = (input: string[]) =>
  stringFormatter(input.slice(findTableStart('File', input), input.length - 1));

export const execCommand = async (command: string, formatter = stringFormatter): Promise<string> => {
  const workingDir = getInputValue('working-directory');
  const output: string[] = [];
  const options = {
    silent: true,
    listeners: {
      stdline: (data: string) => {
        output.push(data);
      }
    },
    cwd: `./${workingDir}`
  };
  try {
    await exec(command, [], options);
    return Promise.resolve(formatter(output));
  } catch (e) {
    error(`ExecCommand error: ${e}`);
    return Promise.reject(e);
  }
};

export const existsCoverageReport = () =>
  fs.existsSync('./coverage/lcov.info');

export const getCoveragePercent = async (): Promise<number> => {
  if (!existsCoverageReport()) {
    return 0;
  }

  const percent = await execCommand('npx coverage-percentage ./coverage/lcov.info --lcov');
  const formattedPercent = Number(parseFloat(percent).toFixed(2));

  await setMainCoverageValue(formattedPercent);

  return formattedPercent;
};

export const generateComment = async (percent: number, summary: string): Promise<string> => {
  const mainMeasure = await getMainCoverageValue();
  return `<p>Total Coverage: <code>${percent} %</code> vs main: <code>${mainMeasure.coverageMeasure.percentage} %</code></p>
<details><summary>Coverage report</summary>

${summary}

</details>`;
};

const isPreviousTotalCoverageComment = comment => (
  comment.user &&
  comment.body &&
  comment.user.login === 'github-actions[bot]' &&
  comment.body.includes('Total Coverage')
);

const deleteComment = (gitHub: RestEndpointMethods) => comment =>
  gitHub.issues.deleteComment({ ...context.repo, comment_id: comment.id });

const deletePreviousComments = async (issueNumber: number) => {
  const gitHub = getRestClient();
  const { data: comments } = await gitHub.issues.listComments({
    ...context.repo,
    per_page: 100,
    issue_number: issueNumber
  });

  return Promise.all(
    comments
      .filter(isPreviousTotalCoverageComment)
      .map(deleteComment(gitHub))
  );
};

export const getIssueNumber = (payload): number | undefined =>
  payload?.pull_request?.number ||
  payload?.issue?.number;

export const createComment = async (comment: string) => {
  const issueNumber = getIssueNumber(context.payload);
  if (!issueNumber) {
    warning('Issue number not found. Impossible to create a comment');
    return;
  }

  const deletePrev = getBooleanInput('delete-previous');
  if (deletePrev) {
    await deletePreviousComments(issueNumber);
  }

  await getRestClient().issues.createComment({
    repo: context.repo.repo,
    owner: context.repo.owner,
    body: comment,
    issue_number: issueNumber
  });
};

const needExecuteCoverageSummary = () => {
  const useExistingReports = getBooleanInput('use-existing-reports');
  if (!useExistingReports) {
    return true;
  }

  // Even when the user configures the action to avoid execute tests,
  // if the coverage report was not found, we need to execute a new tests command
  if (!existsCoverageReport()) {
    warning('No coverage report found!');
    return true;
  }

  return false;
};

export const generateCoverageSummary = async (jestCommand: string): Promise<string> => {
  if (needExecuteCoverageSummary()) {
    return await execCommand(jestCommand, summaryFormatter);
  }

  // Using nyc to generate the report
  const command = 'npx nyc report -t coverage --report=json-summary';
  return await execCommand(command);
};

export const getInputValue = (name: string, options?: InputOptions): string => {
  const value = getInput(name, options);
  info(`Getting parameter ${name} with value ${value}`);
  return value;
};

const getBooleanInput = (input: string): boolean | undefined => {
  switch (getInputValue(input)) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return undefined;
  }
};

const generateChangeSinceParam = (baseCommand: string) => {
  const param = getBooleanInput('only-changes');
  if (!param) {
    return '';
  }

  if (baseCommand.includes('changeSince')) {
    return '';
  }

  if (context.payload.pull_request?.base) {
    return `--changeSince=${context.payload.pull_request?.base.ref}`;
  }

  return '';
};

export const generateJestCommand = () => {
  const baseCommand = getInput('jest-command');
  const changeSinceParam = generateChangeSinceParam(baseCommand);
  return `${baseCommand} ${changeSinceParam}`;
};

export const getMainCoverageValue = async (): Promise<Measure> => {
  info(' [action] getMainCoverageValue');
  return getMeasures(getInputValue('repository'));
};

export const setMainCoverageValue = async (coverage: number): Promise<void> => {
  info(' [action] setMainCoverageValue');
  try {
    await sendMeasures(getInputValue('repository'), coverage);
  } catch (errorMsg) {
    info(` [action] File with coverage value , could not be saved:\n${errorMsg}`);
    error(` [action] File with coverage value , could not be saved:\n${errorMsg}`);
  }
};
