import { info, setFailed } from '@actions/core';
import { start } from './utils';

start()
  .then(() => info('Finished!'))
  .catch(error => {
    console.log('EEE', error);
    setFailed(error.message);
  });
