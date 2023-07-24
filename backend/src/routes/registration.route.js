const express = require('express');
const RegistrationController = require('../controllers/registration.controller');
const RegistrationError = require('../errors/registration.error');
const { extract } = require('../utils/functions.util');
const { HTTP_STATUS } = require('../utils/http.util');

const RegistrationRouter = express.Router();

const handleSuccess = (res,payload) => {
    if(payload)
        res.status(HTTP_STATUS.OK).json({ data: payload });
    else
        res.status(HTTP_STATUS.NO_CONTENT).send();
}

const handleError = (res, error) => {
    if(error instanceof RegistrationError) {
        switch(error.code) {
            case RegistrationError.NOT_FOUND:
                res.status(HTTP_STATUS.NOT_FOUND);
                break;
            default:
                res.status(HTTP_STATUS.BAD_REQUEST);
        }
    } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    res.json({ error: error.toJSON()});
}

RegistrationRouter.post('/', (req, res) => {
    const ati = req.authTokenInfo;
    const payload = extract(req.body,'phoneNumber');
    (new RegistrationController).createRegistration(payload)
        .then(payload => {
            handleSuccess(res,payload);
        })
        .catch(reason => {
            handleError(res,reason);
        })
})

RegistrationRouter.get('/:id', (req, res) => {
    const ati = req.authTokenInfo;
    const { id } = req.params;
    (new RegistrationController).getRegistration(id)
        .then(payload => {
            handleSuccess(res,payload);
        })
        .catch(reason => {
            handleError(res,reason);
        })
})

RegistrationRouter.get('/:id/resend', (req, res) => {
    const ati = req.authTokenInfo;
    const { id } = req.params;
    (new RegistrationController).requestRegistrationCode(id)
        .then(payload => {
            handleSuccess(res,payload);
        })
        .catch(reason => {
            handleError(res,reason);
        })
})

RegistrationRouter.get('/:id/renew', (req, res) => {
    const ati = req.authTokenInfo;
    const { id } = req.params;
    (new RegistrationController).renewRegistration(id)
        .then(payload => {
            handleSuccess(res,payload);
        })
        .catch(reason => {
            handleError(res,reason);
        })
})

module.exports = RegistrationRouter
