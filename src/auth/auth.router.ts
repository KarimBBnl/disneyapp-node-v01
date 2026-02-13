import express from 'express';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';

export function createAuthRouter(db: sqlite3.Database) {
    const router = express.Router();

    router.post('/register', async (req, res) => {
        const { username, password, name } = req.body;

        if (!username || !password || !name) {
            res.status(400).json({ error: "Missing fields" });
            return;
        }

        db.get("SELECT id FROM users WHERE username = ?", [username], async (err: Error | null, row: any) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (row) {
                res.status(400).json({ error: "Username already exists" });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.run("INSERT INTO users (username, password, name) VALUES (?, ?, ?)", [username, hashedPassword, name], function (this: sqlite3.RunResult, err: Error | null) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: "Failed to register user" });
                    return;
                }
                res.json({ message: "User registered successfully", userId: this.lastID });
            });
        });
    });

    router.post('/login', (req, res) => {
        const { username, password } = req.body;

        db.get("SELECT * FROM users WHERE username = ?", [username], async (err, row: any) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (!row) {
                res.status(400).json({ error: "Invalid username or password" });
                return;
            }

            const isMatch = await bcrypt.compare(password, row.password);
            if (!isMatch) {
                res.status(400).json({ error: "Invalid username or password" });
                return;
            }

            // Return user info (excluding password)
            res.json({
                id: row.id,
                username: row.username,
                name: row.name
            });
        });
    });

    return router;
}
