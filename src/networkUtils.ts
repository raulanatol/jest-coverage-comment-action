import { info, error } from '@actions/core';
import { HttpClient } from '@actions/http-client';
import { IHeaders, IHttpClientResponse } from '@actions/http-client/interfaces';

export interface HederFieldValue {
  field: string;
  value: string;
}

const createHeaders = (headeAuthFieldValue?: HederFieldValue): IHeaders => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'origin': 'http://localhost:3000'
  };

  if (headeAuthFieldValue) {
    headers[headeAuthFieldValue.field] = headeAuthFieldValue.value;
  }

  return headers;
};

export const MethodTypeValues = <const>['GET', 'POST'];
export type MethodType = typeof MethodTypeValues[number];

export const sendRequest = async (methodType: MethodType, url: string, auth?: HederFieldValue, body?: any): Promise<any> => {
  const httpClient: HttpClient = new HttpClient('jest-coverage-action');
  info(` [action] sendRequest - Operation: ${methodType}  Url: ${url} Body:\n ${JSON.stringify(body)}`);
  let response: IHttpClientResponse;
  if (methodType === 'GET') {
    response = await httpClient.get(url, createHeaders(auth));
  } else {
    response = await httpClient.post(url, JSON.stringify(body), createHeaders(auth));
  }

  const statusCode = response.message.statusCode;
  if (!statusCode) {
    const message = ' [action] sendRequest - Response not received';
    error(message);
    throw new Error(message);
  }
  info(` [action] sendRequest - Response ${statusCode}`);
  if (statusCode < 200 || statusCode >= 300) {
    const message = ` [action] sendRequest - Not expected response ${statusCode}`;
    error(message);
    throw new Error(message);
  }

  if (statusCode === 204) {
    return;
  }

  const rawBodyResponse: string = await response.readBody();
  return JSON.parse(rawBodyResponse);
};
