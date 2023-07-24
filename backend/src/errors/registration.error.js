const AppError = require("./error");

class RegistrationError extends AppError {

    static GENERAL_ERROR = 11000;
    static NOT_FOUND = 11001;
    static PHONE_NUMBER_ERROR = 11100;
    static PHONE_NUMBER_REQUIRED = 11101;
    static PHONE_NUMBER_IN_USE = 11102;
    static PHONE_NUMBER_UNREGISTERED = 11103;
    static NAME_ERROR = 11200;
    static NAME_REQUIRED = 11201;
    static NAME_LENGTH = 11202;
    static NAME_TOO_SHORT = 11203;
    static NAME_TOO_LONG = 11204;

    static _map = {};

    static {
        this._map[this.GENERAL_ERROR] = "GENERAL_ERROR";
        this._map[this.NOT_FOUND] = "NOT_FOUND";
        this._map[this.PHONE_NUMBER_ERROR] = "PHONE_NUMBER_ERROR";
        this._map[this.PHONE_NUMBER_REQUIRED] = "PHONE_NUMBER_REQUIRED";
        this._map[this.PHONE_NUMBER_IN_USE] = "PHONE_NUMBER_IN_USE";
        this._map[this.PHONE_NUMBER_UNREGISTERED] = "PHONE_NUMBER_UNREGISTERED";
        this._map[this.NAME_ERROR] = "NAME_ERROR";
        this._map[this.NAME_REQUIRED] = "NAME_REQUIRED";
        this._map[this.NAME_LENGTH] = "NAME_LENGTH";
        this._map[this.NAME_TOO_SHORT] = "NAME_TOO_SHORT";
        this._map[this.NAME_TOO_LONG] = "NAME_TOO_LONG";

        this._valid_codes = Object.keys(this._map).map(v => parseInt(v));
    }
}

module.exports = RegistrationError;
