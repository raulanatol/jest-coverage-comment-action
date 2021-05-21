import { RestEndpointMethods } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';
import { getOctokit } from '@actions/github';
import { getInput } from '@actions/core';

export const getRestClient = (): RestEndpointMethods => {
  const octokit = getOctokit(getInput('github-token'));
  return octokit.rest;
};
