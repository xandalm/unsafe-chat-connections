const SPECIAL_CHARS = [
    { b: 0x21, e: 0x2F },
    { b: 0x3A, e: 0x40 },
    { b: 0x5B, e: 0x60 },
    { b: 0x7B, e: 0x7E }
];
const DIGITS = { b: 0x30, e: 0x39 };
const UPPER_CASE_ALPHABETS = { b: 0x41, e: 0x5A };
const LOWER_CASE_ALPHABETS = { b: 0x61, e: 0x7A };

const ONLY_LOWER_CASE = -1;
const ONLY_UPPER_CASE = 1;
const LOWER_AND_UPPER_CASES = 0;

const chars = [];
for(let i=0x21; i <= 0x7E; i++)
    chars.push(i);

const clearLetters = (value) => {
    return !((value >= UPPER_CASE_ALPHABETS.b && value <= UPPER_CASE_ALPHABETS.e) || 
        (value >= LOWER_CASE_ALPHABETS.b && value <= LOWER_CASE_ALPHABETS.e))
}

const clearLowerCase = (value) => {
    return !(value >= LOWER_CASE_ALPHABETS.b && value <= LOWER_CASE_ALPHABETS.e);
}

const clearUpperCase = (value) => {
    return !(value >= UPPER_CASE_ALPHABETS.b && value <= UPPER_CASE_ALPHABETS.e);
}

const clearDigits = (value) => {
    return !(value >= DIGITS.b && value <= DIGITS.e);
}

const clearSpecialChars = (value) => {
    return !SPECIAL_CHARS.find(element => {
        return (value >= element.b && value <= element.e)
    });
}

function buildBucket({ digits, letters, specialChars, alphabetsCase }) {
    var filters = [];
    var curr = 0;
    var next = (value) => {
        if(filters[curr])
            return filters[curr++]?.(value) && next(value)
        else
            curr = 0;
        return true;
    };
    var applyFilters = (value) => {
        curr = 0;
        return next(value);
    }
    if(!letters) {
        filters.push(clearLetters)
    } else {
        switch (alphabetsCase) {
            case ONLY_UPPER_CASE: filters.push(clearLowerCase); break;
            case ONLY_LOWER_CASE: filters.push(clearUpperCase); break;
        }
    }
    if(!digits) filters.push(clearDigits)
    if(!specialChars) filters.push(clearSpecialChars);

    return chars.filter(e => applyFilters(e));
}

const defaultConfig = {
    digits: true,
    letters: true,
    specialChars: true,
    alphabetsCase: LOWER_AND_UPPER_CASES,
    charCanAppear: 1
}

const randomCode = (length, { digits, letters, specialChars, alphabetsCase, charCanAppear } = {}) => {
    const mDigits = digits??defaultConfig.digits;
    const mLetters = letters??defaultConfig.letters;
    const mSpecialChars = specialChars??defaultConfig.specialChars;
    const mAlphabetsCase = alphabetsCase??defaultConfig.alphabetsCase;
    const mCharCanAppear = charCanAppear??defaultConfig.charCanAppear;
    if(!Number.isInteger(length) || length <= 0)
        throw new TypeError("Invalid length");
    if(mDigits && typeof(mDigits) !== 'boolean')
        throw new TypeError("Invalide digits config");
    if(mLetters && typeof(mLetters) !== 'boolean')
        throw new TypeError("Invalide letters config");
    if(mSpecialChars && typeof(mSpecialChars) !== 'boolean')
        throw new TypeError("Invalide specialChars config");
    if(mAlphabetsCase && typeof(mAlphabetsCase) !== 'number' && /^([10])|(\-1)$/.test(`${mAlphabetsCase}`))
        throw new TypeError("Invalide alphabetsCase config");
    if(mCharCanAppear && (!Number.isInteger(mCharCanAppear) || mCharCanAppear <= 0))
        throw new TypeError("Invalid charCanAppear config");
    if(!mDigits & !mLetters & !mSpecialChars)
        throw new TypeError("One character type is required");
    var bucket = buildBucket({
        digits: mDigits,
        letters: mLetters,
        specialChars: mSpecialChars,
        alphabetsCase: mAlphabetsCase,
        charCanAppear: mCharCanAppear
    });
    const pw = [];
    const appears = {};
    if((bucket.length * mCharCanAppear) < length)
        throw new Error("Cannot generate this code size. Please, revise your config");
    for(let i=0; i<length; i++) {
        const w = bucket.length - 1;
        const idx = Math.round(Math.random() * w);
        pw.push(String.fromCharCode(bucket[idx]));
        appears[bucket[idx]] = (appears[bucket[idx]]??0)+1;
        if(appears[bucket[idx]] == mCharCanAppear)
            bucket = bucket.filter((_, i) => i != idx);
    }
    return pw.join('');
}

module.exports = { randomCode };