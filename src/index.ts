import "dotenv/config";
import express from "express";

import { migrate, seedDemoUsers } from "./db.js";
import { itemsRouter } from "./items.js";
import { ordersRouter } from "./orders.js";
import { authRouter } from "./auth.js";

const app = express();
app.get("/", (_, res) => {
    res.send("Nothing here to check 🤷🏽‍♀️");
});

app.use(express.json());

app.use("/auth", authRouter);
app.use("/items", itemsRouter);
app.use("/orders", ordersRouter);

app.listen(process.env.PORT, async () => {
    migrate();
    await seedDemoUsers();
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
    process.exit(0);
});

