const app = require('./app');
const { HTTP_PORT } = require('./config/server.config');

app.listen(HTTP_PORT,() => console.log(`Running at ${HTTP_PORT}.`));
