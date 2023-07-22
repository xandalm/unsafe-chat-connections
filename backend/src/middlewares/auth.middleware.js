const AuthorizationError = require("../errors/auth.error");
const AppError = require("../errors/error");
const { JWTError, inspectJWT, checkJWT } = require("../utils/jwt.util");

const auth = {
    check() {
        return (req, res, next) => {
            if(req.headers && req.headers.authorization) {
                try {
                    const [_,jwt] = req.headers.authorization.split(' ');
                    if(/^Bearer$/.test(_) && jwt && jwt.length > 0) {
                        const { encoded, header, payload } = inspectJWT(jwt);
                        if(checkJWT({ encoded, header, payload })) {
                            req.authTokenInfo = payload;
                            if(next) next();
                            return true;
                        }
                    } else {
                        var err = new AuthorizationError(
                            AuthorizationError.NO_AUTHORIZATION_HEADER,
                            "Missing valid authorization header");
                        if(next) next(err);
                        else throw err;
                    }
                } catch(err) {
                    if(err instanceof JWTError) {
                        switch (err.code) {
                            case JWTError.INVALID:
                                err = new AuthorizationError(
                                    AuthorizationError.INVALID_TOKEN,
                                    err.message
                                );
                                break;
                            case JWTError.ILLEGAL:
                                err = new AuthorizationError(
                                    AuthorizationError.UNAUTHORIZED_TOKEN,
                                    err.message
                                );
                                break;
                            case JWTError.EXPIRED:
                                err = new AuthorizationError(
                                    AuthorizationError.EXPIRED_TOKEN,
                                    err.message
                                );
                                break;
                            default:
                                break;
                        }
                    }
                    if(next) next(err);
                    else throw err;
                }
                return;
            }
            var err = new AuthorizationError(
                AuthorizationError.NO_AUTHORIZATION_HEADER,
                "Missing valid authorization header");
            if(next) next(err);
            else throw err;
        }
    }
}

module.exports = auth
