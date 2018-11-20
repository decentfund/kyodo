module.exports = {
  testEnvironment: './mongo-environment.js',
  transform: {
    '^.+\\.js?$': '<rootDir>/node_modules/babel-jest',
  },
};
