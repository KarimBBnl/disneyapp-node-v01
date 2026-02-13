import express from "express";
import cors from "cors";
import { createMovieRouter } from "./movies/movies.router.js";
import { createAuthRouter } from "./auth/auth.router.js";
import { createFavoritesRouter } from "./favorites/favorites.router.js";
import { createUserRouter } from "./users/users.router.js";
import { createReviewsRouter } from "./reviews/reviews.router.js";
import { createUniverseRouter } from "./universes/universes.router.js";

export function createApp(db: sqlite3.Database) {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get("/health", (_req, res) => {
        res.json({ ok: true, world: "Disney" });
    });

    // Serve static images
    app.use("/images", express.static("data/movies_images"));

    // Serve static videos
    app.use("/videos", express.static("data/movies_video"));

    app.use("/api/movies", createMovieRouter(db));
    app.use("/api/auth", createAuthRouter(db));
    app.use("/api/favorites", createFavoritesRouter(db));
    app.use("/api/users", createUserRouter(db));
    app.use("/api/reviews", createReviewsRouter(db));
    app.use("/api/universes", createUniverseRouter(db));

    return app;
}