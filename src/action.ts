import { info } from '@actions/core';
import { createComment, execCommand, generateComment, generateCoverageSummary, generateJestCommand, getCoveragePercent } from './utils';

export const start = async () => {
  info(await execCommand('echo $GITHUB_HEAD_REF'));
  const jestCommand = generateJestCommand();
  const coverageSummary = await generateCoverageSummary(jestCommand);
  const percent = await getCoveragePercent();
  const comment = await generateComment(percent, coverageSummary);
  await createComment(comment);
};
