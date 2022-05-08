import { info } from '@actions/core';
import { HederFieldValue, sendRequest } from '../networkUtils';
import { getInputValue } from '../utils';
import { Measure } from './measures.type';

const isSendingMeasuresEnable = (): boolean => {
  const url: string = getInputValue('host-measures');

  return Boolean(url);
};

const getAuthHeader = (): HederFieldValue | undefined => {
  const field = getInputValue('auth-header-parameter');
  const value = getInputValue('auth-token');

  if (field && value) {
    return { field, value };
  }

  return undefined;
};


export const sendMeasures = async (repository: string, percentage: number): Promise<void> => {
  if (!isSendingMeasuresEnable()) {
    return;
  }

  const url: string = getInputValue('host-measures');

  info(` [action] sendMeasures - repository: ${repository} coverage percentage: ${percentage}`);
  await sendRequest('POST', url, getAuthHeader(), { repository, percentage });
};

export const getMeasures = async (repository: string): Promise<Measure> => {
  if (!isSendingMeasuresEnable()) {
    return {} as any as Measure;
  }

  const url: string = getInputValue('host-measures') + `?repository=${repository}`;

  info(` [action] getMeasures - GET to url: ${url} for repository: ${repository}`);
  const response = await sendRequest('GET', url, getAuthHeader());

  const measure: Measure = response as any as Measure;
  info(` [action] getMeasures - Data:  ${measure}`);

  return measure;
};
