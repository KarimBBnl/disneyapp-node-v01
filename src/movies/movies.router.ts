import { Router } from "express";
import type { Db } from "../db.js";

export function createMovieRouter(db: Db) {
    const router = Router();

    router.get("/", (req, res) => {
        const { q, year, genre, sort, type } = req.query;
        let sql = "SELECT * FROM movies WHERE 1=1";
        const params: any[] = [];

        if (type) {
            sql += " AND type = ?";
            params.push(type);
        }

        if (q) {
            sql += " AND title LIKE ?";
            params.push(`%${q}%`);
        }

        if (year) {
            sql += " AND year = ?";
            params.push(year);
        }

        if (genre) {
            sql += " AND genres LIKE ?";
            params.push(`%${genre}%`);
        }

        if (sort === 'title_asc') {
            sql += " ORDER BY title ASC";
        } else if (sort === 'title_desc') {
            sql += " ORDER BY title DESC";
        } else if (sort === 'year_asc') {
            sql += " ORDER BY year ASC";
        } else if (sort === 'year_desc') {
            sql += " ORDER BY year DESC";
        }

        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error("Error fetching movies:", err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            res.json(rows);
        });
    });

    router.get("/:slug", (req, res) => {
        const sql = "SELECT * FROM movies WHERE name_slug = ?";
        db.get(sql, [req.params.slug], (err, row) => {
            if (err) {
                console.error("Error fetching movie:", err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (!row) {
                res.status(404).json({ error: "Movie not found" });
                return;
            }
            res.json(row);
        });
    });

    router.delete("/:slug", (req, res) => {
        const { slug } = req.params;
        db.run("DELETE FROM movies WHERE name_slug = ?", [slug], function (err) {
            if (err) {
                console.error("Error deleting movie:", err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: "Movie not found" });
                return;
            }
            res.json({ message: "Movie deleted successfully" });
        });
    });

    router.post("/", (req, res) => {
        const { title, name_slug, year, description, genres, youtube_url, edad_minima, actores, universe, type, photo_url } = req.body;

        if (!title || !name_slug || !year || !description || !genres) {
            res.status(400).json({ error: "Missing fields" });
            return;
        }

        const sql = "INSERT INTO movies (title, name_slug, year, description, genres, youtube_url, edad_minima, actores, universe, type, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const params = [title, name_slug, year, description, genres, youtube_url || '', edad_minima || 0, actores || '', universe || '', type || '', photo_url || ''];

        db.run(sql, params, function (err) {
            if (err) {
                console.error("Error creating movie:", err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            res.json({ message: "Movie created successfully", id: this.lastID });
        });
    });

    router.put("/:slug", (req, res) => {
        const { slug } = req.params;
        const { title, name_slug, year, description, genres, youtube_url, edad_minima, actores, universe, type, photo_url } = req.body;

        if (!title || !name_slug || !year || !description || !genres) {
            res.status(400).json({ error: "Missing fields" });
            return;
        }

        const sql = "UPDATE movies SET title = ?, name_slug = ?, year = ?, description = ?, genres = ?, youtube_url = ?, edad_minima = ?, actores = ?, universe = ?, type = ?, photo_url = ? WHERE name_slug = ?";
        const params = [title, name_slug, year, description, genres, youtube_url || '', edad_minima || 0, actores || '', universe || '', type || '', photo_url || '', slug];

        db.run(sql, params, function (err) {
            if (err) {
                console.error("Error updating movie:", err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: "Movie not found" });
                return;
            }
            res.json({ message: "Movie updated successfully" });
        });
    });

    return router;
}
