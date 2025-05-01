const EventEmitter = require('events');
const sharedEmitter = new EventEmitter();

module.exports = sharedEmitter;