// Allowed users that can dish out points
// module.exports.userList = [
// ]

// Allowed point types
module.exports.point_types = ['GOV', 'CODE', 'FUND', 'SOCIAL'];

module.exports.domains = [
  'matrix.org',
  'status.im',
  'matrix.decent.fund',
  'gitter.im',
];

// TODO: Get max_points from token balances minus used points
module.exports.max_points = 10000;

module.exports.sheet_id =
  process.env.NODE_ENV == 'production'
    ? '1e7qIMSWR0mQARHFPdU0a2RGlRT8zOcsBkDv-iSYroMs'
    : '1e7qIMSWR0mQARHFPdU0a2RGlRT8zOcsBkDv-iSYroMs';
module.exports.sheet_tab_name = 'PointsBot (DONT RENAME!)!A1:F1';
