const util = require('util');
/* 

    * - (not set)
    R - root
    A - admin
    C - customer
    G - guest

    32bit (each bit is one role privilege)
    idea: 
        one role can have many privileges
        bigger value -> bigger privileges
        i.e.: admin grant customer privileges too

    bit lvl     role
    ----------------
    31      |   R
    30      |   A
    29...2  |   *
    1       |   C
    0       |   G

*/
const buffer32 = new Uint32Array(1);

function uint32(value) {
    buffer32[0] = value;
    return buffer32[0];
}

const GUEST = uint32(0x01);
const CUSTOMER = uint32(0x02);
const ADMIN = uint32((0x01 << 30) | CUSTOMER | GUEST);
const ROOT = uint32((0x01 << 31) | ADMIN);

const ROLE_NAME_2_VALUE = {
    'root': ROOT,
    'admin': ADMIN,
    'customer': CUSTOMER,
    'guest': GUEST,
}

const ROLE_VALUE_2_NAME = Object.fromEntries(Object.entries(ROLE_NAME_2_VALUE).map(e => [e[1],e[0]]));

class AuthRole {

    static #internal = false;
    
    #value;
    #name;

    constructor(value,name) {
        if(!AuthRole.#internal)
            throw new TypeError("Private constructor");
        AuthRole.#internal = false;
        this.#name = name;
        this.#value = value;
    }

    get name() { return this.#name }
    get value() { return this.#value }

    valueOf () {
        return this.#value;
    }

    [util.inspect.custom]() {
        return {
            value: this.value,
            name: this.name
        }
    }

    static #fromName(name) {
        AuthRole.#internal = true;
        name = name.toLowerCase();
        let value = ROLE_NAME_2_VALUE[name] ?? 0x00;
        return new AuthRole(value,name);
    }

    static #fromValue(value) {
        AuthRole.#internal = true;
        let name = ROLE_VALUE_2_NAME[value];
        return new AuthRole(value,name);
    }

    static from(role) {
        if(typeof role === 'string')
            return AuthRole.#fromName(role);
        if(typeof role === 'number')
            return AuthRole.#fromValue(role);
        throw new TypeError("'role' type must be number or string");
    }

    static nameOf(value) {
        if(typeof value !== 'number')
            throw new TypeError("'value' type must be number");
        return ROLE_VALUE_2_NAME[value];
    }

    static valueOf(name) {
        if(typeof name !== 'string')
            throw new TypeError("'name' type must be string");
        return ROLE_NAME_2_VALUE[name.toLowerCase()] ?? 0x01;
    }

    equals(role) {
        if(role instanceof AuthRole)
            return this.value === role.value;
        if(typeof role === 'number')
            return this.value == role;
        if(typeof role === 'string')
            return this.name === role.toLowerCase();
        throw new TypeError("'role' type must be AuthRole, number or string");
    }

    includes(role) {
        if(role instanceof AuthRole || typeof(role) === 'number') {
            return (this & role) == role;
        }
        if(typeof(role) === 'string') {
            return this.includes(AuthRole.from(role));
        }
        throw new TypeError("'role' type must be AuthRole, number or string");
    }

}

AuthRole.GUEST = GUEST;
AuthRole.CUSTOMER = CUSTOMER;
AuthRole.ADMIN = ADMIN;
AuthRole.ROOT = ROOT;

Object.seal(AuthRole);

module.exports = AuthRole
