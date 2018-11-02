const SystemError = function SystemError(message) {
  this.name = 'SystemError';
  this.message = message || '';
};

SystemError.prototype = new Error();
SystemError.prototype.constructor = SystemError;

const ModelError = function ModelError(message, model, value) {
  this.name = 'ModelError';
  this.message = message || '';
  this.model = model;
  this.value = value;
};

ModelError.prototype = new Error();
ModelError.prototype.constructor = ModelError;

export { SystemError, ModelError };
