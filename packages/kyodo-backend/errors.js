const SystemError = function SystemError(message) {
  this.name = 'SystemError';
  this.message = message || '';
};

SystemError.prototype = new Error();
SystemError.prototype.constructor = SystemError;

module.exports = {
  SystemError,
};
