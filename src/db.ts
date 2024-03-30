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
            role TEXT NOT NULL CHECK(role IN ('admin', 'user')) DEFAULT 'user'
        )
    `).run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            quantity INTEGER NOT NULL
        )
    `).run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            item_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (item_id) REFERENCES items(id)
        )
    `).run();

    // create admin user if not exists
    const admin = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
    if (!admin) {
        console.log("No admin user found, creating one...");
        db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)")
            .run(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD, "admin");
    }
}
