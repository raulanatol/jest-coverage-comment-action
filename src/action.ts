import { createComment, generateComment, generateCoverageSummary, generateJestCommand, getCoveragePercent } from './utils';

export const start = async () => {
  const jestCommand = generateJestCommand();
  const coverageSummary = await generateCoverageSummary(jestCommand);
  const percent = await getCoveragePercent();
  const comment = await generateComment(percent, coverageSummary);
  await createComment(comment);
};
