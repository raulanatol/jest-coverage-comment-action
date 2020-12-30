import { createComment, generateComment, generateCoverageSummary, generateJestCommand, getCoveragePercent } from './utils';
import { info } from '@actions/core';

export const start = async () => {
  const jestCommand = generateJestCommand();
  info(`jestCommand: ${jestCommand}`);
  const coverageSummary = await generateCoverageSummary(jestCommand);
  const percent = await getCoveragePercent();
  const comment = generateComment(percent, coverageSummary);
  await createComment(comment);
};
