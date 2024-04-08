import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { db } from "./db.js";
import { validate } from "./utils.js";
import { LoginSchema, type User } from "./schema.js";

export const authRouter = express.Router();
authRouter.post("/login", validate(LoginSchema), async (_, res) => {
    const data = res.locals as z.infer<typeof LoginSchema>;
    const user = db.prepare("SELECT * FROM users WHERE username = @username")
        .get(data) as User;
    if (!user || !await (bcrypt.compare(data.password, user.password || ""))) {
        return res.status(401).json({
            type: "error",
            status: 401,
            message: "Invalid username or password!",
        });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.SECRET_KEY);
    return res.json({
        type: "success",
        status: 200,
        data: {
            token: token,
        },
    });
});
