import sqlite3 from "sqlite3";

const db = new sqlite3.Database("data/disney.sqlite");

db.all("SELECT name_slug, title FROM movies", (err, rows) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(JSON.stringify(rows, null, 2));
    db.close();
});
