import { Router } from "express";
import type { Db } from "../db.js";

export function createUniverseRouter(db: Db) {
    const router = Router();

    router.get("/", (req, res) => {
        const sql = "SELECT * FROM universes ORDER BY id ASC";
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error("Error fetching universes:", err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            res.json(rows);
        });
    });

    return router;
}
