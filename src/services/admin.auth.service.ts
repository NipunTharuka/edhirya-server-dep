import {log} from "../util/logger";
import {aggregateUserRepo, createUserRepo, findOneUserRepo, getLoggedUserRepo} from "../data-access/admin.repo";
import bcrypt from "bcrypt";
import {SETTINGS} from "../constants/commons.settings";
import {generateJWT} from "./token.service";
import {findOneAndDeleteUserRefreshTokenRepo} from "../data-access/token.repo";
import passwordGen from "generate-password";
import {createUserRefNo} from "../util/refferenceNumbers";
import config from "config";
import {sendEmailService} from "./email.service";



export const signInUserService = async (password: any, email: any) => {
    try {
        const admin = (await aggregateUserRepo({ email }))[0];
        if (!admin) {
            throw { message: "Authentication failed, Retry!" };
        }
        if (!admin.active) {
            throw {
                message: "Inactive User!",
            };
        }
        return await validateUser(password, admin);
    } catch (e: any) {
        log.error(e.message || "User not found");
        throw e;
    }
};

const validateUser = async (password: any, admin: any) => {
    try {
        const result = await bcrypt.compare(password, admin.password);
        if (!result) {
            throw { message: "Authentication failed, Retry!" };
        }
        return await generateJWT(admin, false, SETTINGS.USERS.ADMIN);
    } catch (e: any) {
        log.error(e.message);
        throw e;
    }
};

export const logoutUserService = async (data: any) => {
    await findOneAndDeleteUserRefreshTokenRepo(data);
};

export const createUserService = async (data: any) => {
    try {
        const emailCheck: any = await findOneUserRepo({ email: data.email });
        if (emailCheck) {
            throw { message: "Email is already existing!", emailCheck: true };
        } else {
            const password = passwordGen.generate({
                length: 6,
                uppercase: false,
            });
            data.password = password;
            data.refNo = await createUserRefNo();
            const admin: any = await createUserRepo(data);
            sendEmailService(
                SETTINGS.EMAIL.USER_NEW_PASSWORD_SEND,
                {
                    name: admin.firstname + " " + admin.lastname,
                    email: admin.email,
                    password,
                    url: `${config.get("frontEndUrl")}/auth/login`.toString(),
                },
                admin.email,
                `Welcome to Edhirya`
            );
            admin.password = undefined;
            return admin;
        }
    } catch (e) {
        throw e;
    }
};

export const getOneUserService = async (id: any) => {
  try {
      return (await getLoggedUserRepo(id))[0];
  } catch (e: any) {
      throw e
  }

};
