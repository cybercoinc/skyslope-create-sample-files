require('dotenv').config();

const { URL } = process.env;
const { CLIENT_ID } = process.env;
const { CLIENT_SECRET } = process.env;
const { ACCESS_KEY_PROD } = process.env;
const { ACCESS_SECRET_PROD } = process.env;

module.exports = {
  URL,
  CLIENT_ID,
  CLIENT_SECRET,
  ACCESS_KEY_PROD,
  ACCESS_SECRET_PROD,
};
