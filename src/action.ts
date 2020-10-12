import { getInput } from '@actions/core';
import { createComment, generateComment, generateCoverageSummary, getCoveragePercent } from './utils';

export const start = async () => {
  const jestCommand = getInput('jest-command');
  const coverageSummary = await generateCoverageSummary(jestCommand);
  const percent = await getCoveragePercent();
  const comment = generateComment(percent, coverageSummary);
  await createComment(comment);
};
