// // import { getCoveragePercent } from '../utils';
// import { execCommand, generateComment } from '../utils';
//
describe('utils', () => {
  test('should return true', () => {
    expect(3 > 2).toBeTruthy();
  });
});
//
// // test('should return a coverage', async () => {
// //   const result = await getCoveragePercent();
// //   expect(a).toBe(2);
// // });
// // xtest('should return a coverage', async () => {
// //   const result = await generateCoverageSummary('yarn test --coverage main.test.ts');
// //   expect(result).toBe(2);
// // });
//
// xtest('should execute the command', async () => {
//   const result = await execCommand('yarn test --coverage main.test.ts');
//   // console.log('💣 [[[[]]]]', result);
//   expect(result).toBe(2);
// });
//
// test('should generateComment', () => {
//   const summary: string[] = [
//     '----------|---------|----------|---------|---------|-------------------',
//     'File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s·',
//     '----------|---------|----------|---------|---------|-------------------',
//     'All files |       0 |        0 |       0 |       0 |                  ·',
//     '----------|---------|----------|---------|---------|-------------------"'
//   ];
//   const result = generateComment(10, summary.join('\n'));
//   expect(result).toBe('23');
// });
//
// // import { execCommand } from '../utils';
// //
// // test('should ', async () => {
// //   const coverageSummary = await execCommand('yarn test --coverage main.test.ts');
// //   console.log('result', coverageSummary);
// //   return coverageSummary.toString();
// // });
