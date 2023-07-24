const mongodb = require('../config/database.config');
const { v4: uuid } = require('uuid');
const AppError = require('../errors/error');
const { IS_DEVELOPMENT } = require("../utils/env.util");
const { MONGODB_DUPLICATE_KEY } = require('../utils/mongodb.util');
const RegistrationError = require('../errors/registration.error');
const { randomCode } = require('../utils/rcg.util');

const EXPIRATION_TIME = 1000 * 60 * 1;

class Registration {

    static collection = "Registration";
    #props = {};

    constructor(props) {
        if(props) {
            this.phoneNumber = props.phoneNumber;
            this.name = props.name;
        }
    }
    
    set phoneNumber(value) {
        if(value == null) {
            delete this.#props.phone_number;
        } else {
            if(typeof value !== 'string')
                throw new RegistrationError("'phoneNumber' type must be string.");
            value = value.trim();
            this.#props.phone_number = value;
        }
    }

    set name(value) {
        if(value == null) {
            delete this.#props.name;
        } else {
            if(typeof(value) != 'string')
                throw new TypeError("'name' type must be string.");
            value = value.trim();
            value = value.replace(/ {2,}/g,' '); // remove 2+ gaps
            if(value.length < MIN_NAME_LENGTH || value.length > MAX_NAME_LENGTH)
                throw new RegistrationError(RegistrationError.NAME_LENGTH,`'name' length must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH}.`);
            this.#props.name = value;
        }
    }

    get id() { return this.#props._id }
    get phoneNumber() { return this.#props.phone_number }
    get name() { return this.#props.name }

    get createdAt() { return this.#props.created_at }
    get updatedAt() { return this.#props.updated_at }
    get expireAt() { return this.#props.expire_at }

    _fromDB(data) {
        this.#props = Object.assign({}, data);
        return this;
    }

    toJSON() {
        return {
            id: this.id,
            phoneNumber: this.phoneNumber,
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            expireAt: this.expireAt
        }
    }

    #assertValidEntry() {
        if(this.#props.phone_number == undefined)
            throw new CustomerError(CustomerError.PHONE_NUMBER_REQUIRED,"'phoneNumber' is required.");
    }

    async insert() {
        var res = false;
        this.#assertValidEntry();
        try {
            var conn = await mongodb.connect();
            const id = uuid();
            const code = randomCode(6, { digits: true, letters: true, alphabetsCase: 1 });
            var createdAt, expireAt;
            await conn.db()
                .collection(Registration.collection)
                .insertOne({
                    ...this.#props,
                    code,
                    created_at: createdAt = new Date,
                    expire_at: expireAt = new Date(createdAt.getTime() + EXPIRATION_TIME)
                });
            this.#props._id = id;
            this.#props.code = code;
            this.#props.created_at = createdAt;
            this.#props.expire_at = expireAt;
            this.notify();
            res = true;
        } catch(err) {
            if(IS_DEVELOPMENT) console.log(err);
            if(err.code === MONGODB_DUPLICATE_KEY)
                throw new RegistrationError(RegistrationError.PHONE_NUMBER_IN_USE,"'phoneNumber' already in use.");
            else
                throw new AppError(AppError.INTERNAL_SERVER,"Internal Server Error");
        } finally {
            conn?.close();
        }
        return res;
    }

    async delete() {
        try {
            var conn = await mongodb.connect();
            await conn.db()
                .collection(Registration.collection)
                .deleteOne({ _id: this.id });
        } catch(err) {
            if(IS_DEVELOPMENT) console.log(err);
        } finally {
            conn?.close();
        }
    }

    async renew() {
        var res;
        try {
            var conn = await mongodb.connect();
            const code = randomCode(6, { digits: true, letters: true, alphabetsCase: 1 });
            var updatedAt,expireAt;
            await conn.db()
                .collection(Registration.collection)
                .updateOne(
                    { _id: this.id },
                    {
                        $set: {
                            updated_at: updatedAt = new Date,
                            expire_at: expireAt = new Date(updatedAt.getTime() + EXPIRATION_TIME),
                            code
                        }
                    }
                )
            this.#props.code = code;
            this.#props.updated_at = updatedAt;
            this.#props.expire_at = expireAt;
            this.notify();
            res = true;
        } catch(err) {
            if(IS_DEVELOPMENT) console.log(err);
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal Server Error");
        } finally {
            conn?.close();
        }
        return res;
    }

    static async #get(filter) {
        var res = null;
        try {
            var conn = await mongodb.connect();
            var found = await conn.db()
                .collection(Registration.collection)
                .findOne(filter);
            if(found)
                res = (new Registration)._fromDB(found);
        } catch (err) {
            if(IS_DEVELOPMENT) console.log(err);
            throw new AppError(AppError.INTERNAL_SERVER,"Internal Server Error");
        } finally {
            conn?.close();
        }
        return res;
    }

    static getById(id) {
        return this.#get({ _id: id });
    }

    static getByPhoneNumber(phoneNumber) {
        return this.#get({ phone_number: phoneNumber });
    }

    isExpired() {
        return this.#props.expire_at.getTime() <= Date.now();
    }

    notify() {
        // TODO
        //  -IMPLEMENTATION OF SMS NOTIFY
        if(IS_DEVELOPMENT) console.log(this.#props.code);
    }

    isValidCode(code) {
        return this.#props.code === code;
    }
}

module.exports = Registration
