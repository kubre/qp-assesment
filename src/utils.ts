import express from "express";
import { z } from "zod";


export function validate(schema: z.Schema) {
    return function (req: express.Request, res: express.Response, next: express.NextFunction) {
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

