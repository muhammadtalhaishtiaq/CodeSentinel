const isDev = process.env.NODE_ENV !== 'production';

const logger = {
  error: (...args) => console.error('[ERROR]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  info: (...args) => console.log('[INFO]', ...args),
  debug: (...args) => {
    if (isDev) console.log('[DEBUG]', ...args);
  },
};

module.exports = logger;
