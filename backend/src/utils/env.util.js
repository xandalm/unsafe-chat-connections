const { NODE_ENV } = require("../config/server.config");

const IS_DEVELOPMENT = NODE_ENV == 'development';

module.exports = {
    IS_DEVELOPMENT
}
