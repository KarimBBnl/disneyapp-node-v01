import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data/disney.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("--- Tables ---");
    db.each("SELECT name FROM sqlite_master WHERE type='table'", (err, table) => {
        if (err) console.error(err);
        console.log("Table:", table.name);

        console.log(`--- Schema for ${table.name} ---`);
        db.all(`PRAGMA table_info(${table.name})`, (err, rows) => {
            if (err) console.error(err);
            console.table(rows);
        });
    });
});
