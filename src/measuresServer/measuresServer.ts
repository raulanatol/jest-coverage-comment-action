import { error, info } from '@actions/core';
import { HederFieldValue, sendRequest } from '../networkUtils';
import { execCommand, getInputValue } from '../utils';
import { Measure } from './measuresServer.type';

export const isSendingMeasuresEnable = (): boolean => {
  const url: string = getInputValue('measures-server-host');
  const enabled = Boolean(url);

  if (!enabled) {
    info('Sending measures to server is disable as NO host is recognized');
  }

  return enabled;
};

const getAuthHeader = (): HederFieldValue | undefined => {
  const field = getInputValue('measures-server-auth-header-parameter');
  const value = getInputValue('measures-server-auth-token');

  if (field && value) {
    return { field, value };
  }

  return undefined;
};

const getOrigin = (): string | undefined => {
  const origin = getInputValue('measures-server-cors-origin');

  if (origin) {
    return origin;
  }

  return undefined;
};

const sendMeasures = async (repository: string, coveragePercentage: number): Promise<void> => {
  const url: string = getInputValue('measures-server-host');

  await sendRequest('POST', url, getAuthHeader(), { repository, coveragePercentage }, getOrigin());
};

const getMeasures = async (repository: string): Promise<Measure | undefined> => {
  const url: string = getInputValue('measures-server-host') + `?repository=${repository}`;

  const response = await sendRequest('GET', url, getAuthHeader(), undefined, getOrigin());
  const measure: Measure = response as any as Measure;

  return measure;
};

export const setMainCoverageValue = async (coverage: number): Promise<void> => {
  if (!isSendingMeasuresEnable()) {
    return undefined;
  }
  const mainBranchName = getInputValue('measures-server-main-branch');
  try {
    const branch = await execCommand('printenv GITHUB_HEAD_REF');
    info(`Main branch [${mainBranchName}] current branch [${branch}]`);
    if (branch !== mainBranchName) {
      info(`Measure does NOT need to be send as we are NOT in Main branch [${mainBranchName}]`);
      return;
    }
  } catch (errorMsg) {
    error(`Could not retireve current branch:\n${JSON.stringify(errorMsg)}`);
  }

  const repository = getInputValue('measures-server-repository');
  info(`Measure needs to be send for ${repository} as we are in Main branch [${mainBranchName}]`);
  try {
    await sendMeasures(repository, coverage);
  } catch (errorMsg) {
    error(`Report measures NOT sent to server:\n${JSON.stringify(errorMsg)}`);
  }
};

export const getMainCoverageValue = async (): Promise<Measure | undefined> => {
  if (!isSendingMeasuresEnable()) {
    return undefined;
  }
  return await getMeasures(getInputValue('measures-server-repository'));
};

const roundPercentage = (percentage: number): number => {
  return Math.round((percentage + Number.EPSILON) * 100) / 100;
};

export const generateCompareComment = async (percent: number, mainPercentage: number, summary: string): Promise<string> => {
  let difference: string;
  let icon = ':green_circle:';
  if (percent > mainPercentage) {
    difference = `+ ${roundPercentage(percent - mainPercentage)}`;
  } else if (percent < mainPercentage) {
    difference = `<strong>- ${roundPercentage(percent - mainPercentage)}</strong>`;
    icon = ':yellow_circle:';
  } else {
    difference = ' 0.00';
  }

  return `<p>${icon} Total Coverage: <code>${percent} %</code> (<code>${difference}</code>) vs main: <code>${mainPercentage} %</code></p>
<details><summary>Coverage report</summary>

${summary}

</details>`;
};
