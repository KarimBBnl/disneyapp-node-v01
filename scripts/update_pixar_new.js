import sqlite3 from "sqlite3";

const db = new sqlite3.Database("data/disney.sqlite");

db.run("UPDATE universes SET image_url = ? WHERE name = ?",
    ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Pixar_new_logo.svg/1280px-Pixar_new_logo.svg.png?20230324131505", "Pixar"],
    (err) => {
        if (err) {
            console.error("Error updating Pixar logo:", err.message);
        } else {
            console.log("Pixar logo updated successfully to new SVG version.");
        }
        db.close();
    }
);
