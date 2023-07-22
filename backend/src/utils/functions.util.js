
const extract = (src,...args) => {
    if(src.constructor != ({}).constructor)
        throw new TypeError("Both arguments must be object type");
    var res = {};
    if(args.length == 0)
        return res;
    for (const key of args) {
        if(src.hasOwnProperty(key))
            res[key] = src[key];
    }
    return res;
}

module.exports = {
    extract
}
