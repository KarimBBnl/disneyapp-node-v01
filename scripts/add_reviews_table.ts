import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data/disney.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Adding reviews table to database at:", dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movie_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(movie_id) REFERENCES movies(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) {
            console.error("Error creating reviews table:", err);
        } else {
            console.log("Created reviews table successfully.");
        }
        db.close();
    });
});
