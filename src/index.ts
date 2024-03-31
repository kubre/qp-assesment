import "dotenv/config";
import express from "express";
import { z } from "zod";

import { migrate, db } from "./db.js";

/*
Design API endpoints
1. Admin Responsibilities:
   - Add new grocery items to the system
   - View existing grocery items
   - Remove grocery items from the system
   - Update details (e.g., name, price) of existing grocery items
   - Manage inventory levels of grocery items
2. User Responsibilities:
   - View the list of available grocery items
   - Ability to book multiple grocery items in a single order
*/


const app = express();
app.get("/", (_, res) => {
    res.send("Nothing here to check 🤷🏽‍♀️");
});

// TODO
// const usersRouter = express.Router();
// usersRouter.get("/login", (req, res) => { });
// usersRouter.get("/register", (req, res) => { });
// app.use("/users", usersRouter);

const AddOrUpdateItem = z.object({
    name: z.string().min(1),
    price: z.number().min(0),
    quantity: z.number().min(0),
});

type Item = z.infer<typeof AddOrUpdateItem> & { id: number };


app.use(express.json());

function validate(schema: z.Schema) {
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


const itemsRouter = express.Router();
itemsRouter.post("/", validate(AddOrUpdateItem), (_, res) => {
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
itemsRouter.get("/", (req, res) => {
    const fromId = parseInt(String(req.query.fromId)) || 0;
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
itemsRouter.get("/:id", (req, res) => {
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
itemsRouter.put("/:id", validate(AddOrUpdateItem), (req, res) => {
    const data = res.locals as z.infer<typeof AddOrUpdateItem>;

    console.log(data);
    const stmt = db.prepare("UPDATE items SET name = @name, price = @price, quantity = @quantity WHERE id = @id");
    const changes = stmt.run({ id: req.params.id, ...data }).changes;
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
// itemsRouter.delete("/:id", (req, res) => { });
app.use("/items", itemsRouter);

// const ordersRouter = express.Router();
// ordersRouter.get("/", (req, res) => { });
// ordersRouter.post("/", (req, res) => { });

app.listen(process.env.PORT, async () => {
    migrate();
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
    process.exit(0);
});

