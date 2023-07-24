const AppError = require("../errors/error");
const RegistrationError = require("../errors/registration.error");
const Registration = require("../models/registration.model");

const handleError = (error) => {
    if(error instanceof AppError) {
        return error;
    }
    return new AppError(AppError.INTERNAL_SERVER,"Internal Server Error");
}

class RegistrationController {
    createRegistration(props) {
        return new Promise(async (resolve, reject) => {
            try {
                const reg = new Registration(props);
                await reg.insert();
                resolve(reg.toJSON());
            } catch (error) {
                reject(handleError(error));
            }
        })
    }

    renewRegistration(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const reg = await Registration.getById(id);
                await reg.renew();
                resolve(reg.toJSON());
            } catch (error) {
                reject(handleError(error));
            }
        })
    }

    getRegistration(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const reg = await Registration.getById(id);
                if(!reg) {
                    reject(new RegistrationError(RegistrationError.NOT_FOUND,"Registration not found"));
                    return;
                }
                resolve(reg.toJSON())
            } catch (error) {
                reject(handleError(res,error))
            }
        })
    }

    requestRegistrationCode(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const reg = await Registration.getById(id);
                reg?.notify();
                resolve()
            } catch(error) {
                reject(handleError(res,error))
            }
        })
    }
}

module.exports = RegistrationController
