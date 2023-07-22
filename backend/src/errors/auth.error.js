const AppError = require("./error");

class AuthorizationError extends AppError {

    static GENERAL_ERROR = 10100;
    static NO_AUTHORIZATION_HEADER = 10101;
    static INVALID_TOKEN = 10102;
    static UNAUTHORIZED_TOKEN = 10103;
    static EXPIRED_TOKEN = 10104;

    static _map = {};

    static {
        this._map[this.NO_AUTHORIZATION_HEADER] = "NO_AUTHORIZATION_HEADER";
        this._map[this.INVALID_TOKEN] = "INVALID_TOKEN";
        this._map[this.UNAUTHORIZED_TOKEN] = "UNAUTHORIZED_TOKEN";
        this._map[this.EXPIRED_TOKEN] = "EXPIRED_TOKEN";
        
        this._valid_codes = Object.keys(this._map).map(v => parseInt(v));
    }
}

module.exports = AuthorizationError;
