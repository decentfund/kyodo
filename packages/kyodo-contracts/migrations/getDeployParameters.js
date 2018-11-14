var deployParameters = {
  accounts: {},
  domains: [
    {
      code: 'GOV',
      distribution: 1,
    },
    {
      code: 'FUND',
      distribution: 1,
    },
    {
      code: 'SOCIAL',
      distribution: 1,
    },
    {
      code: 'BUIDL',
      distribution: 1,
    },
  ],
};

try {
  deployParameters = require('./deploy_parameters.json');
} catch (e) {
  console.log('Deploy parameters not found');
}

module.exports = deployParameters;
