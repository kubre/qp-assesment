import express from "express";
import { db } from "./db.js";
import { AddOrder, OrderItem, type Order, type Item } from "./schema.js";
import { validate } from "./utils.js";
import { z } from "zod";
import { randomUUID } from "crypto";


export const ordersRouter = express.Router();

ordersRouter.post("/", validate(AddOrder), (_, res) => {
    const data = res.locals as z.infer<typeof AddOrder>;

    // TODO: Add user id of the logged in user
    const userId = 1;
    const orderId = randomUUID();

    const params = "?,".repeat(data.items.length).slice(0, -1);
    const selProdQtyStmt = db.prepare(
        `SELECT id, name, quantity FROM items WHERE id in (${params})`);
    const insStmt = db.prepare(
        `INSERT INTO orders (orderId, userId, itemId, quantity)
        VALUES (@orderId, @userId, @itemId, @quantity)`
    );
    const updateStmt = db.prepare(
        "UPDATE items SET quantity = quantity - @quantity WHERE id = @itemId");


    const orderTrans = db.transaction((userId: number, items: z.infer<typeof OrderItem>[]) => {
        const productQty = selProdQtyStmt.all(items.map((item) => item.itemId)) as Omit<Item, "price">[];
        for (const item of items) {
            const prod = productQty.find((prod) => prod.id === item.itemId);
            if (!prod) {
                throw new Error(`Item not found with id ${item.itemId}`);
            }
            if (prod.quantity < item.quantity) {
                throw new Error(`Not enough quantity for item ${prod.name}`);
            }
            insStmt.run({ orderId: orderId, userId: userId, itemId: item.itemId, quantity: item.quantity });
            updateStmt.run({ itemId: item.itemId, quantity: item.quantity });
        }
    });

    try {
        orderTrans(userId, data.items);
        return res.status(201).json({
            type: "success",
            status: 201,
            data: {
                orderId: orderId
            }
        });
    } catch (err) {
        let message = "An error occurred while placing the order";
        if (err instanceof Error) {
            message = err.message;
        }
        return res.status(400).json({
            type: "error",
            status: 400,
            message: message,
        });
    }
});

ordersRouter.get("/:orderId", (req, res) => {
    const orders = db.prepare("SELECT * FROM orders WHERE orderId = @orderId")
        .all({ orderId: req.params.orderId }) as Order[];

    if (!orders.length) {
        return res.status(404).json({
            type: "error",
            status: 404,
            message: "Order not found",
        });
    }

    return res.json({
        type: "success",
        status: 200,
        data: orders,
    });
});
