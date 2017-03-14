//app default settings configuration settings

const _ = require('lodash');
const debug = require('debug')('app:config');
const argv = require('yargs').default('PLATFORM', 'desktop').argv;
// const argv = require('yargs').default('PLATFORM', 'brightsign').argv;

const parsedPlatform = _.isString(argv.PLATFORM) && argv.PLATFORM.toLowerCase().indexOf('brightsign') > -1
  ? 'brightsign'
  : 'desktop';

debug('Creating default configuration.');
const config = {
  platform: parsedPlatform
};

config.globals = {
  '__PLATFORM__': JSON.stringify(parsedPlatform)
};

module.exports = config;
