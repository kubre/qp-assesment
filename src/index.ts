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

const CreateItemRequest = z.object({
    name: z.string().min(1),
    price: z.number().min(0),
    quantity: z.number().min(0),
});

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
                status: "error",
                statusCode: 400,
                error: errors,
                message: message,
            });
        }

        res.locals = result.data;
        return next();
    }
}


const itemsRouter = express.Router();
itemsRouter.post("/", validate(CreateItemRequest), (_, res) => {
    const data = res.locals as z.infer<typeof CreateItemRequest>;

    const stmt = db.prepare("INSERT INTO items (name, price, quantity) VALUES (@name, @price, @quantity)");
    if (stmt.run(data).changes === 0) {
        return res.status(500).json({
            status: "error",
            statusCode: 500,
            message: "Failed to create item",
        });
    }

    return res.status(201).json({
        status: "success",
        statusCode: 201,
        data: data,
    });
});
// itemsRouter.get("/", (req, res) => { });
// itemsRouter.get("/:id", (req, res) => { });
// itemsRouter.put("/:id", (req, res) => { });
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

