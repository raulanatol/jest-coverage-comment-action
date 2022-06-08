import { info } from '@actions/core';
import { sendRequest } from '../../networkUtils';
import { generateCompareComment, getMainCoverageValue, setMainCoverageValue } from '../measuresServer';

jest.mock('@actions/core', () => ({
  info: jest.fn()
}));

jest.mock('../../utils', () => ({
  execCommand: jest.fn().mockImplementationOnce(() => 'feature/X').mockImplementationOnce(() => 'main'),
  getInputValue: (param) => {
    switch (param) {
      case 'measures-server-host' :
        return 'host';
      case 'measures-server-main-branch' :
        return 'main';
      case 'measures-server-repository' :
        return 'web-components';
    }
  }
}));

jest.mock('../../networkUtils', () => ({
  sendRequest: jest.fn()
}));

describe('measuresServer', () => {
  describe('setMainCoverageValue', () => {
    test('should not try to send metrics as its not in main branch', async () => {
      jest.clearAllMocks();

      await setMainCoverageValue(56);

      expect(info).toBeCalledWith('Measure does NOT need to be send as we are NOT in Main branch [main]');
      expect(sendRequest).not.toBeCalled();
    });

    test('should send request with metrics as its in main branch', async () => {
      jest.clearAllMocks();

      await setMainCoverageValue(56);

      expect(info).toBeCalledWith('Measure needs to be send for web-components as we are in Main branch [main]');
      expect(sendRequest).toHaveBeenCalledWith('POST', 'host', undefined, { repository: 'web-components', coveragePercentage: 56 }, undefined);
    });
  });

  describe('getMainCoverageValue', () => {
    test('should send request to get metrics for repository', async () => {
      jest.clearAllMocks();

      await getMainCoverageValue();

      expect(sendRequest).toHaveBeenCalledWith('GET', 'host?repository=web-components', undefined, undefined, undefined);
    });
  });

  describe('generateCompareComment', () => {
    const commonExpected = [
      '<details><summary>Coverage report</summary>',
      '',
      '',
      '',
      '</details>'
    ];

    test('comment when main has a greater coverage than compared branch', () => {
      const expected = [
        '<p>:yellow_circle: Total Coverage: <code>67.78 %</code> (<code><strong>- -30.25</strong></code>) vs main: <code>98.03 %</code></p>',
        ...commonExpected
      ].join('\n');
      expect(generateCompareComment(67.78, 98.03, '')).toStrictEqual(expected);
    });

    test('comment when main has a lower coverage than compared branch', () => {
      const expected = [
        '<p>:green_circle: Total Coverage: <code>67.78 %</code> (<code>+ 9.75</code>) vs main: <code>58.03 %</code></p>',
        ...commonExpected
      ].join('\n');
      expect(generateCompareComment(67.78, 58.03, '')).toStrictEqual(expected);
    });

    test('comment when main has the same coverage than compared branch', () => {
      const expected = [
        '<p>:green_circle: Total Coverage: <code>67.78 %</code> (<code> 0.00</code>) vs main: <code>67.78 %</code></p>',
        ...commonExpected
      ].join('\n');
      expect(generateCompareComment(67.78, 67.78, '')).toStrictEqual(expected);
    });
  });

});
