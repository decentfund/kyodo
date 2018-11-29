const titleRegex = /for\s(.+)/;
const parseTitle = message => message.toLowerCase().split(titleRegex)[1];
module.exports = {
  parseTitle,
};
