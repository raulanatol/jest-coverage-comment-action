import { info } from '@actions/core';
import { HederFieldValue, sendRequest } from '../networkUtils';
import { getInputValue } from '../utils';
import { Measure } from './measures.type';

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

export const sendMeasures = async (repository: string, coveragePercentage: number): Promise<void> => {
  const url: string = getInputValue('measures-server-host');

  await sendRequest('POST', url, getAuthHeader(), { repository, coveragePercentage }, getOrigin());
};

export const getMeasures = async (repository: string): Promise<Measure | undefined> => {
  const url: string = getInputValue('measures-server-host') + `?repository=${repository}`;

  const response = await sendRequest('GET', url, getAuthHeader(), undefined, getOrigin());
  const measure: Measure = response as any as Measure;

  return measure;
};
