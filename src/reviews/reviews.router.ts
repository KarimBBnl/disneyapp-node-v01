import { Router } from "express";
import type { Db } from "../db.js";

export function createReviewsRouter(db: Db) {
    const router = Router();

    // GET /:movieId - Get all reviews for a movie
    router.get("/:movieId", (req, res) => {
        const { movieId } = req.params;
        const sql = `
            SELECT reviews.*, users.name as user_name 
            FROM reviews 
            JOIN users ON reviews.user_id = users.id 
            WHERE movie_id = ? 
            ORDER BY created_at DESC
        `;

        db.all(sql, [movieId], (err, rows) => {
            if (err) {
                console.error("Error fetching reviews:", err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            res.json(rows);
        });
    });

    // POST / - Create a new review
    router.post("/", (req, res) => {
        let { movieId, userId, rating, text, movie_slug, username } = req.body;

        if (!text || (!movieId && !movie_slug) || (!userId && !username)) {
            res.status(400).json({ error: "Missing fields" });
            return;
        }

        if (rating < 1 || rating > 5) {
            res.status(400).json({ error: "Rating must be between 1 and 5" });
            return;
        }

        const insertReview = (mId: number, uId: number) => {
            const sql = "INSERT INTO reviews (movie_id, user_id, rating, text) VALUES (?, ?, ?, ?)";
            db.run(sql, [mId, uId, rating, text], function (err) {
                if (err) {
                    console.error("Error creating review:", err);
                    res.status(500).json({ error: "Internal server error" });
                    return;
                }
                res.json({ message: "Review added successfully", id: this.lastID });
            });
        };

        if (movie_slug && username) {
            // Manual entry mode: Lookup IDs
            db.get("SELECT id FROM movies WHERE name_slug = ?", [movie_slug], (err, movieRow: any) => {
                if (err) {
                    console.error("Error finding movie:", err);
                    res.status(500).json({ error: "Internal server error" });
                    return;
                }
                if (!movieRow) {
                    res.status(404).json({ error: `Movie not found: ${movie_slug}` });
                    return;
                }

                db.get("SELECT id FROM users WHERE username = ?", [username], (err, userRow: any) => {
                    if (err) {
                        console.error("Error finding user:", err);
                        res.status(500).json({ error: "Internal server error" });
                        return;
                    }
                    if (!userRow) {
                        res.status(404).json({ error: `User not found: ${username}` });
                        return;
                    }
                    insertReview(movieRow.id, userRow.id);
                });
            });
        } else {
            // Standard mode (ID based)
            insertReview(movieId, userId);
        }
    });

    return router;
}
