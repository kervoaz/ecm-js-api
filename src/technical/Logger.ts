import { ILogLevel } from 'js-logger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const Logger = require('js-logger');

Logger.useDefaults();
Logger.setLevel(getLogLevel(process.env.LOG_LEVEL));
Logger.info(`Logger loaded`);

export const MessageLogger = Logger.get('MessageLogger');
MessageLogger.setLevel(getLogLevel(process.env.MESSAGE_LOG_LEVEL));

function getLogLevel(logLevel: any): ILogLevel {
  if (!logLevel) {
    return Logger.INFO;
  }
  const level = String(logLevel).toLowerCase();
  if (level == 'trace') {
    return Logger.TRACE;
  } else if (level == 'debug') {
    return Logger.DEBUG;
  } else if (level == 'info') {
    return Logger.INFO;
  } else if (level == 'time') {
    return Logger.TIME;
  } else if (level == 'warn') {
    return Logger.WARN;
  } else if (level == 'error') {
    return Logger.ERROR;
  } else if (level == 'off') {
    return Logger.OFF;
  } else {
    console.error('Unknow log level ' + logLevel);
    return Logger.INFO;
  }
}
