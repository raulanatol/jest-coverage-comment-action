import { info, setFailed } from '@actions/core';
import { start } from './action';

start()
  .then(() => info('Finished! V0.1.1.3.4'))
  .catch(error => setFailed(error.message));
