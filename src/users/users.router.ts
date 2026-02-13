import { Router } from "express";
import bcrypt from 'bcryptjs';
import type { Db } from "../db.js";

export function createUserRouter(db: Db) {
    const router = Router();

    // Create new user (Manual Entry)
    router.post("/", async (req, res) => {
        const { username, password, name } = req.body;

        if (!username || !password || !name) {
            res.status(400).json({ error: "Missing fields" });
            return;
        }

        try {
            // Check if user exists
            const existingUser = await new Promise<any>((resolve, reject) => {
                db.get("SELECT id FROM users WHERE username = ?", [username], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (existingUser) {
                res.status(400).json({ error: "Username already exists" });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.run("INSERT INTO users (username, password, name) VALUES (?, ?, ?)", [username, hashedPassword, name], function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: "Failed to create user" });
                    return;
                }
                res.json({ message: "User created successfully", userId: this.lastID });
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    return router;
}
