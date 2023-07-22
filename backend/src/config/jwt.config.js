const { JWT_SECRET } = require("./server.config");

const header = {
    alg: "HS256",
    typ: "JWT"
};
const secret = JWT_SECRET;
// issuer
const iss = "ChatConnections";
// audience
const aud = "ChatConnections-Client";

module.exports = {
    header,
    secret,
    iss,
    aud
}
