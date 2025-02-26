import { Router } from "express";
import * as path from "path";
import {
    adminLoginController,
    adminRefreshTokenController, createUserController, findOneUserController,
    logoutUserController,
} from "../controllers/admin.auth.controller";

import { Shield } from "../middleware/auth/shield";

const publicKey = path.join(__dirname, "../../config/public.pem");
const shield = new Shield(publicKey);

export const userAuthRouter = Router();

userAuthRouter.post("/login", adminLoginController);
userAuthRouter.post("/refresh-token", adminRefreshTokenController);
userAuthRouter.post("/logout", shield.auth(), logoutUserController);
userAuthRouter.post("/create", shield.auth(), createUserController);
userAuthRouter.get("/get-one/:id", shield.auth(), findOneUserController);
