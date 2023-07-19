const dotenv = require('dotenv');

dotenv.config();

const NODE_ENV = process.env.NODE_ENV;

const HTTP_PORT = process.env.HTTP_PORT;
const HTTPS_PORT = process.env.HTTPS_PORT;

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_URI_TEST = process.env.MONGODB_URI_TEST;

module.exports = {
    NODE_ENV,
    HTTP_PORT,
    HTTPS_PORT,
    MONGODB_URI,
    MONGODB_URI_TEST
}
