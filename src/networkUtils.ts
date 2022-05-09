import { info, error } from '@actions/core';
import { fetch } from 'cross-fetch';

export interface HederFieldValue {
  field: string;
  value: string;
}

const createHeaders = (headeAuthFieldValue?: HederFieldValue): HeadersInit => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  if (headeAuthFieldValue) {
    headers[headeAuthFieldValue.field] = headeAuthFieldValue.value;
  }

  return headers;
};

export const MethodTypeValues = <const>['GET', 'POST'];
export type MethodType = typeof MethodTypeValues[number];

export const sendRequest = async (methodType: MethodType, url: string, auth?: HederFieldValue, body?: any): Promise<any> => {
  const request: RequestInit = {
    method: methodType,
    credentials: 'include',
    headers: createHeaders(auth),
    body: JSON.stringify(body)
  };

  info(` [action] sendRequest - Operation: ${methodType}  Url: ${url} Body:\n ${JSON.stringify(body)}`);
  const response = await fetch(url, request);
  info(` [action] sendRequest - Response ${response.status}`);
  if (response.status < 200 || response.status >= 300) {
    error(` [action] sendRequest - Not expected response ${response.status}`);
    throw new Error(` [action] sendRequest - Not expected response ${response.status}`);
  }

  if (response.status === 204) {
    return;
  }

  return response.json();
};
