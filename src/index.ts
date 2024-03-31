import "dotenv/config";
import express from "express";
import { migrate } from "./db.js";

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
const usersRouter = express.Router();
usersRouter.get("/login", (req, res) => { });
usersRouter.get("/register", (req, res) => { });
app.use("/users", usersRouter);

const itemsRouter = express.Router();
itemsRouter.get("/", (req, res) => { });
itemsRouter.get("/:id", (req, res) => { });
itemsRouter.post("/", (req, res) => { });
itemsRouter.put("/:id", (req, res) => { });
itemsRouter.delete("/:id", (req, res) => { });
app.use("/items", itemsRouter);

const ordersRouter = express.Router();
ordersRouter.get("/", (req, res) => { });
ordersRouter.post("/", (req, res) => { });

const PORT = 8000;
app.listen(PORT, async () => {
    migrate();
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
    process.exit(0);
});

