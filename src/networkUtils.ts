import { info, error } from '@actions/core';
import { HttpClient } from '@actions/http-client';
import { IHeaders, IHttpClientResponse } from '@actions/http-client/interfaces';

export interface HederFieldValue {
  field: string;
  value: string;
}

const createHeaders = (headeAuthFieldValue?: HederFieldValue, origin?: string): IHeaders => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  if (origin) {
    headers['origin'] = origin;
  }

  if (headeAuthFieldValue) {
    headers[headeAuthFieldValue.field] = headeAuthFieldValue.value;
  }

  return headers;
};

export const MethodTypeValues = <const>['GET', 'POST'];
export type MethodType = typeof MethodTypeValues[number];

export const sendRequest = async (methodType: MethodType, url: string, auth?: HederFieldValue, body?: any, origin?: string): Promise<any> => {
  const httpClient: HttpClient = new HttpClient('jest-coverage-action');
  info(`Network request via: ${methodType} Origin: ${origin} Url: ${url} Body: ${JSON.stringify(body)}`);
  let response: IHttpClientResponse;
  if (methodType === 'GET') {
    response = await httpClient.get(url, createHeaders(auth, origin));
  } else {
    response = await httpClient.post(url, JSON.stringify(body), createHeaders(auth, origin));
  }

  const statusCode = response.message.statusCode;

  if (!statusCode) {
    const message = 'NO response received';
    error(message);
    throw new Error(message);
  }

  info(`Network response: ${statusCode}`);
  if (statusCode < 200 || statusCode >= 300) {
    const message = `Unexpected response ${statusCode}. Expected status code 2XX`;
    error(message);
    throw new Error(message);
  }

  if (statusCode === 204) {
    info('Network response: 204 - No Content');
    return;
  }

  const rawBodyResponse: string = await response.readBody();
  const bodyResponse: any = JSON.parse(rawBodyResponse);
  info(`Network response body: ${bodyResponse}`);
  return bodyResponse;
};
