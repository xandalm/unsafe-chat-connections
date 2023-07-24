const express = require('express');
const cors = require('cors');
const compression = require('compression');
const AuthorizationError = require('./errors/auth.error');
const AppError = require('./errors/error');
const auth = require('./middlewares/auth.middleware');
const { HTTP_STATUS } = require('./utils/http.util');
const { IS_DEVELOPMENT } = require('./utils/env.util');
const { generateJWT } = require('./utils/jwt.util');
const AuthRole = require('./utils/auth.util');

const app = express();

app.use(compression())
app.use(express.json());

app.get('/greeting', (req, res) => {
    try{
        const accessToken = generateJWT({ role: AuthRole.nameOf(AuthRole.GUEST) });
        res.json({ accessToken });
    } catch(err) {
        if(IS_DEVELOPMENT) console.error(err);
        next(err);
    }
})

app.use(auth.check());

app.get('/hello', (req, res) => {
    const ati = req.authTokenInfo;
    const role = AuthRole.from(ati.role);
    if(!role.includes(AuthRole.GUEST)) {
        res.status(HTTP_STATUS.UNAUTHORIZED).send();
        return;
    }
    res.json({ message: 'Hi, nice to meet you!', by: 'ChatConnections Server' });
})

app.post('/signup', (req, res) => {
    const ati = req.authTokenInfo;
    res.status(HTTP_STATUS.NOT_IMPLEMENTED).send();
});

app.post('/signup/:timestamp/:id/:code', (req, res) => {
    const ati = req.authTokenInfo;
    res.status(HTTP_STATUS.NOT_IMPLEMENTED).send();
});

app.get('/login', (req, res) => {
    const ati = req.authTokenInfo;
    res.status(HTTP_STATUS.NOT_IMPLEMENTED).send();
})

const handleAuthorizationError = (res,error) => {
    switch(error.code) {
        case AuthorizationError.NO_AUTHORIZATION_HEADER:
        case AuthorizationError.INVALID_TOKEN:
            res.status(HTTP_STATUS.BAD_REQUEST);
            break;
        default:
            res.status(HTTP_STATUS.UNAUTHORIZED);
    }
    res.json({ error: error.toJSON() });
}

const handleAppError = (error,res) => {
    switch(error.constructor) {
        case AuthorizationError: handleAuthorizationError(res,error); break;
        default:
            res.json(error);
    }
}

app.use((err,req,res,next) => {
    if(err instanceof AppError) {
        handleAppError(err,res);
        return;
    }
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send();
})

module.exports = app;
