import { info, error } from '@actions/core';
import { HttpClient } from '@actions/http-client';
import { IHeaders, IHttpClientResponse } from '@actions/http-client/interfaces';
import { fetch } from 'cross-fetch';

export interface HederFieldValue {
  field: string;
  value: string;
}

const createHeaders3 = (headeAuthFieldValue?: HederFieldValue): HeadersInit => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  if (headeAuthFieldValue) {
    headers[headeAuthFieldValue.field] = headeAuthFieldValue.value;
  }

  return headers;
};

const createHeaders = (headeAuthFieldValue?: HederFieldValue): IHeaders => {
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

export const sendRequest3 = async (methodType: MethodType, url: string, auth?: HederFieldValue, body?: any): Promise<any> => {
  const request: RequestInit = {
    method: methodType,
    credentials: 'include',
    headers: createHeaders3(auth),
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

  return await response.json();
};

export const sendRequest = async (methodType: MethodType, url: string, auth?: HederFieldValue, body?: any): Promise<any> => {
  const httpClient: HttpClient = new HttpClient();
  info(` [action] sendRequest - Operation: ${methodType}  Url: ${url} Body:\n ${JSON.stringify(body)}`);
  let response: IHttpClientResponse;
  if (methodType === 'GET') {
    response = await httpClient.get(url, createHeaders(auth));
  } else {
    response = await httpClient.post(url, body, createHeaders(auth));
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
