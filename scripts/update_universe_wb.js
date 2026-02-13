import sqlite3 from "sqlite3";

const db = new sqlite3.Database("data/disney.sqlite");

db.run("UPDATE universes SET name = ?, image_url = ? WHERE name = ?",
    ["Warner Brothers", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Warner_Bros_logo.svg/1200px-Warner_Bros_logo.svg.png", "National Geographic"],
    (err) => {
        if (err) {
            console.error("Error updating universe to Warner Brothers:", err.message);
        } else {
            console.log("Universe updated from National Geographic to Warner Brothers successfully.");
        }
        db.close();
    }
);
