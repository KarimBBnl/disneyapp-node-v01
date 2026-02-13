import express from 'express';
import sqlite3 from 'sqlite3';

export function createFavoritesRouter(db: sqlite3.Database) {
    const router = express.Router();

    // Get favorites for a user
    router.get('/:userId', (req, res) => {
        const userId = req.params.userId;
        const sql = `
            SELECT movies.* 
            FROM movies 
            JOIN favorites ON movies.id = favorites.movie_id 
            WHERE favorites.user_id = ?
        `;
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            res.json(rows);
        });
    });

    // Add a favorite
    router.post('/', (req, res) => {
        const { userId, movieId } = req.body;
        if (!userId || !movieId) {
            res.status(400).json({ error: "Missing userId or movieId" });
            return;
        }

        const sql = "INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)";
        db.run(sql, [userId, movieId], function (this: sqlite3.RunResult, err: Error | null) {
            if (err) {
                // Check for unique constraint violation (already favorite)
                if (err.message.includes('UNIQUE constraint failed')) {
                    res.status(400).json({ error: "Already a favorite" });
                    return;
                }
                console.error(err);
                res.status(500).json({ error: "Failed to add favorite" });
                return;
            }
            res.json({ message: "Added to favorites", id: this.lastID });
        });
    });

    // Remove a favorite
    router.delete('/', (req, res) => {
        const { userId, movieId } = req.body;
        if (!userId || !movieId) {
            res.status(400).json({ error: "Missing userId or movieId" });
            return;
        }

        const sql = "DELETE FROM favorites WHERE user_id = ? AND movie_id = ?";
        db.run(sql, [userId, movieId], function (this: sqlite3.RunResult, err: Error | null) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Failed to remove favorite" });
                return;
            }
            res.json({ message: "Removed from favorites" });
        });
    });

    return router;
}
