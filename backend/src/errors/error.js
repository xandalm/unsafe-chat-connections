
class AppError extends Error {

    static GENERAL_ERROR = 10000;
    static INTERNAL_SERVER = 10001;
    
    static _map = {};
    static _valid_codes;

    static {
        this._map[this.GENERAL_ERROR] = "GENERAL_ERROR";
        this._map[this.INTERNAL_SERVER] = "INTERNAL_SERVER";

        this._valid_codes = Object.keys(this._map).map(v => parseInt(v));
    }

    constructor(code, message) {
        super(message);
        if(!this.constructor.isValidCode(code))
            throw new TypeError("Invalid Code Error");
        this.code = code;
        this.name = this.constructor.name;
    }

    get codeName() {
        const c = this.constructor;
        return c._map[this.code] ?? c._map[c.GENERAL_ERROR];
    }

    static isValidCode(code) {
        return this._valid_codes.includes(code);
    }

    toJSON() {
        return {
            name: this.codeName,
            code: this.code,
            category: this.name,
            message: this.message
        };
    }
}

/*
    10000 AppError
        10100 AuthorizationError
            10101 AUTHORIZATION
            10102 INVALID
            10103 UNAUTHORIZED
            10104 EXPIRED
        11000 CustomerError
            11100 PHONE_NUMBER_ERROR

            11200 NAME_ERROR

            11300 PASSWORD_ERROR

        12000 RegistrationError

        13000 MessageError


*/

module.exports = AppError;
