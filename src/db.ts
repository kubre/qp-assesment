import Database from "better-sqlite3";
import type { Database as TDatabase } from "better-sqlite3";

export const db: TDatabase = new Database(process.env.DB_PATH, { verbose: console.log });
db.pragma("journal_mode = WAL");

export function migrate() {
    // create user table with admin, user roles in sqlite3
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'user')) DEFAULT 'user',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS orders (
            userId INTEGER NOT NULL,
            itemId INTEGER NOT NULL,
            orderId TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id),
            FOREIGN KEY (itemId) REFERENCES items(id)
        )
    `).run();

    db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_orders_orderId ON orders(orderId)
    `).run();

    // create admin user if not exists
    const admin = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
    if (!admin) {
        console.log("No admin user found, creating one...");
        db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)")
            .run(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD, "admin");
    }
}
