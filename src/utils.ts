import express from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";

export function authenticated(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.headers.authorization) {
        return res.status(401).json({
            type: "error",
            status: 401,
            message: "Unauthorized",
        });
    }

    const token = req.headers.authorization.split(" ")[1] ?? "";
    try {
        const user = jwt.verify(token, process.env.SECRET_KEY) as { id: number, role: "admin" | "user" };
        req.user = user;
        return next();
    } catch (err) {
        return res.status(401).json({
            type: "error",
            status: 401,
            message: "Unauthorized",
        });
    }
}

export function adminAuthorized(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.user?.role !== "admin") {
        return res.status(403).json({
            type: "error",
            status: 403,
            message: "Forbidden",
        });
    }
    return next();
}

export function validate(schema: z.Schema) {
    return function(req: express.Request, res: express.Response, next: express.NextFunction) {
        const result = schema.safeParse(req.body.data);

        if (!result.success) {
            const errors = result.error.flatten()["fieldErrors"];
            const message = "Error: " + Object.entries(errors)
                .map(([key, value]) => `${key} is ${value}`)
                .join(" and ");
            return res.status(400).json({
                type: "error",
                status: 400,
                error: errors,
                message: message,
            });
        }

        res.locals = result.data;
        return next();
    }
}

