import { RestEndpointMethods } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';
import { getOctokit } from '@actions/github';
import { getInputValue } from './utils';

export const getRestClient = (): RestEndpointMethods => {
  const octokit = getOctokit(getInputValue('github-token'));
  return octokit.rest;
};
