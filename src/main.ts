import { info, setFailed } from '@actions/core';
import { start } from './action';

start()
  .then(() => info('Finished!Main1'))
  .catch(error => setFailed(error.message));
