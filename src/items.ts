import express from "express";
import { db } from "./db.js";
import { AddOrUpdateItem, type Item } from "./schema.js";
import { validate, authenticated, adminAuthorized } from "./utils.js";
import { z } from "zod";

export const itemsRouter = express.Router();

itemsRouter.post("/", authenticated, adminAuthorized, validate(AddOrUpdateItem), (_, res) => {
    const data = res.locals as z.infer<typeof AddOrUpdateItem>;

    const stmt = db.prepare("INSERT INTO items (name, price, quantity) VALUES (@name, @price, @quantity)");
    if (stmt.run(data).changes === 0) {
        return res.status(500).json({
            type: "error",
            status: 500,
            message: "Failed to create item",
        });
    }

    return res.status(201).json({
        type: "success",
        status: 201,
        data: data,
    });
});

// Simple paginated get all API
itemsRouter.get("/", authenticated, (req, res) => {
    const idParsed = z.number({ coerce: true })
        .min(1)
        .default(0)
        .safeParse(req.query.fromId);
    let fromId = idParsed.success ? idParsed.data : 0;


    const items = db.prepare("SELECT * FROM items where id >= @fromId limit 11")
        .all({ fromId }) as Item[];

    // Pass this nextId to api as query param to get next 10 items
    let nextId = items?.[10]?.id ?? null;
    if (items.length === 11) {
        items.pop();
    }

    return res.json({
        type: "success",
        status: 200,
        data: {
            items: items,
            nextId: nextId,
        },
    });
});

itemsRouter.get("/:id", authenticated, (req, res) => {
    const item = db.prepare("SELECT * FROM items WHERE id = @id")
        .get({ id: req.params.id }) as Item;

    if (!item) {
        return res.status(404).json({
            type: "error",
            status: 404,
            message: "Item not found",
        });
    }

    return res.json({
        type: "success",
        status: 200,
        data: item,
    });
});

itemsRouter.put("/:id", authenticated, adminAuthorized, validate(AddOrUpdateItem), (req, res) => {
    const data = res.locals as z.infer<typeof AddOrUpdateItem>;
    const idParsed = z.number({ coerce: true }).safeParse(req.params.id);
    if (!idParsed.success) {
        return res.status(400).json({
            type: "error",
            status: 400,
            message: `Invalid id ${req.params.id}`,
        });
    }

    const stmt = db.prepare("UPDATE items SET name = @name, price = @price, quantity = @quantity WHERE id = @id");
    const changes = stmt.run({ id: idParsed.data, ...data }).changes;
    if (changes === 0) {
        return res.status(500).json({
            type: "error",
            status: 500,
            message: `Failed to update item with id ${req.params.id}`,
        });
    }

    return res.status(200).json({
        type: "success",
        status: 200,
        data: data,
    });
});

itemsRouter.delete("/:id", authenticated, adminAuthorized, (req, res) => {
    const idParsed = z.number({ coerce: true }).safeParse(req.params.id);
    if (!idParsed.success) {
        return res.status(400).json({
            type: "error",
            status: 400,
            message: `Invalid id ${req.params.id}`,
        });
    }

    const getStmt = db.prepare("SELECT * FROM items WHERE id = @id");
    const item = getStmt.get({ id: idParsed.data }) as Item;

    const stmt = db.prepare("DELETE FROM items WHERE id = @id");
    const changes = stmt.run({ id: idParsed.data }).changes;
    if (changes === 0) {
        return res.status(500).json({
            type: "error",
            status: 500,
            message: `Failed to delete item with id ${req.params.id}`,
        });
    }

    return res.status(200).json({
        type: "success",
        status: 200,
        data: item,
    });
});
