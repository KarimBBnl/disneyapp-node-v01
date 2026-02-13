import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../data/disney.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Add photo_url column to movies table
    db.run("ALTER TABLE movies ADD COLUMN photo_url TEXT DEFAULT ''", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log("Column photo_url already exists.");
            } else {
                console.error("Error adding column photo_url:", err);
            }
        } else {
            console.log("Column photo_url added successfully.");
        }
    });
});

db.close();
