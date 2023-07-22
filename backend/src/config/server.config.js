const dotenv = require('dotenv');

dotenv.config();

const abort = () => {
    console.error(
        "#################################################\n"+
        "#                  ATTENTION                    #\n"+
        "# --------------------------------------------- #\n"+
        "#  Please setup .env attributes.                #\n"+
        "#  See server.config.js for more informations.  #\n"+
        "#################################################\n"
    );
    process.exit(1);
};

// All are importants and need to be defined
const NODE_ENV = process.env.NODE_ENV ?? abort();
const HTTP_PORT = process.env.HTTP_PORT ?? abort();
const HTTPS_PORT = process.env.HTTPS_PORT ?? abort();

const MONGODB_URI = process.env.MONGODB_URI ?? abort();
const MONGODB_URI_TEST = process.env.MONGODB_URI_TEST ?? abort();

const CUSTOMER_SECRET = process.env.CUSTOMER_SECRET ?? abort();
const JWT_SECRET = process.env.JWT_SECRET ?? abort();

module.exports = {
    NODE_ENV,
    HTTP_PORT,
    HTTPS_PORT,
    MONGODB_URI,
    MONGODB_URI_TEST,
    CUSTOMER_SECRET,
    JWT_SECRET
}
