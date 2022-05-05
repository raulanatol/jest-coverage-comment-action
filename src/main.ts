import { info, setFailed } from '@actions/core';
import { start } from './action';

start()
  .then(() => info('Finished!'))
  .catch(error => setFailed(error.message));
