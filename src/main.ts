import { info, setFailed } from '@actions/core';
import { start } from './action';

start()
  .then(() => info('Finished! V0.1.1.2'))
  .catch(error => setFailed(error.message));
