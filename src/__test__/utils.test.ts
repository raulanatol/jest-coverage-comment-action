import { generateComment, generateJestCommand, getCoveragePercent, getIssueNumber, getMainCoverageValue, stringFormatter, summaryFormatter } from '../utils';
import { exec } from '@actions/exec';

jest.mock('@actions/github', () => ({
  context: {
    payload: {
      pull_request: {
        base: {
          ref: 'fakeBaseRef'
        }
      }
    }
  }
}));

jest.mock('@actions/core', () => ({
  getInput: (param) => {
    switch (param) {
      case 'jest-command':
        return 'npx jest --coverage';
      case 'only-changes':
        return 'true';
    }
  },
  warning: () => {
    return jest.fn();
  }
}));

jest.mock('@actions/exec', () => ({
  exec: jest.fn()
}));


const jestCommandWithChangeSinceOption = 'npx jest --coverage --changeSince=fakeBaseRef';

const validJestReportResponse: string[] = [
  '----------|---------|----------|---------|---------|-------------------',
  'File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s·',
  '----------|---------|----------|---------|---------|-------------------',
  'All files |       0 |        0 |       0 |       0 |                  ·',
  '----------|---------|----------|---------|---------|-------------------"'
];


describe('utils', () => {
  describe('getIssueNumber', () => {
    test('should return undefined if the payload is undefined', () => {
      expect(getIssueNumber(undefined)).toBeUndefined();
    });

    test('should return undefined if is not a valid payload', () => {
      const invalidPayload = { invalid: true };
      expect(getIssueNumber(invalidPayload)).toBeUndefined();
    });

    test('should return the pull_request number if the payload is a valid pull_request payload', () => {
      const pullRequestPayload = { pull_request: { number: 12 } };
      expect(getIssueNumber(pullRequestPayload)).toBe(12);
    });

    test('should return the issue number if the payload is a valid issue payload', () => {
      const issuePayload = { issue: { number: 12 } };
      expect(getIssueNumber(issuePayload)).toBe(12);
    });
  });

  describe('stringFormatter', () => {
    test('should return a valid string when a simple input is provided', () => {
      expect(stringFormatter(['foo', 'bar'])).toBe('foo\nbar');
    });

    test('should return an empty string if a empty input is provided', () => {
      expect(stringFormatter([])).toBe('');
    });
  });

  describe('summaryFormatter', () => {
    test('should return an empty string if a empty input is provided', () => {
      expect(summaryFormatter([])).toBe('');
    });

    test('should return a string with no first and last line', () => {
      expect(summaryFormatter(['first', 'middle', 'last'])).toBe('middle');
    });

    test('should return a string that starts after the last empty line', () => {
      expect(summaryFormatter(['first', 'second', 'File', 'third', 'fourth'])).toBe('File\nthird');
    });

    test('should return a valid format when a real coverage input was provided', () => {
      const expected = [
        'File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s·',
        '----------|---------|----------|---------|---------|-------------------',
        'All files |       0 |        0 |       0 |       0 |                  ·'
      ].join('\n');

      expect(summaryFormatter(validJestReportResponse)).toBe(expected);
    });
  });

  describe('generateComment', () => {
    test('should return a valid comment', async () => {
      const realSummary = summaryFormatter(validJestReportResponse);

      const result = await generateComment(30, realSummary);

      const expected = [
        '<p>Total Coverage: <code>30 %</code> vs main: <code>-1 %</code></p>',
        '<details><summary>Coverage report</summary>',
        '',
        'File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s·',
        '----------|---------|----------|---------|---------|-------------------',
        'All files |       0 |        0 |       0 |       0 |                  ·',
        '',
        '</details>'
      ].join('\n');

      expect(result).toStrictEqual(expected);
    });
  });

  describe('generateJestCommand', () => {
    it('should return the jest command with the changeSince option', () => {
      const result = generateJestCommand();
      expect(result).toBe(jestCommandWithChangeSinceOption);
    });
  });

  describe('getCoveragePercent', () => {
    it('should returns 0 when ./coverage/lcov.info file does not exists', async () => {
      const fs = require('fs');
      fs.existsSync = jest.fn().mockReturnValue(false);

      expect(await getCoveragePercent()).toBe(0);
    });

    it('should call to an external command if the ./coverage/lcov.info file exists', async () => {
      const fs = require('fs');
      fs.existsSync = jest.fn().mockReturnValue(true);

      await getCoveragePercent();

      expect(exec).toBeCalledWith(
        'npx coverage-percentage ./coverage/lcov.info --lcov',
        [],
        expect.anything()
      );
    });
  });
});
