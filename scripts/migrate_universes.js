import sqlite3 from "sqlite3";

const db = new sqlite3.Database("data/disney.sqlite");

const runMigration = () => {
    return new Promise((resolve) => {
        db.serialize(() => {
            console.log("[db] Creando tabla 'universes'...");

            db.run(`CREATE TABLE IF NOT EXISTS universes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                image_url TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    console.error("[db] Error creando tabla 'universes':", err.message);
                } else {
                    console.log("[db] Tabla 'universes' lista.");

                    const uStmt = db.prepare("INSERT OR IGNORE INTO universes (name, image_url) VALUES (?, ?)");
                    uStmt.run("Disney", "https://logodownload.org/wp-content/uploads/2020/11/disney-plus-logo-1.png");
                    uStmt.run("Pixar", "https://1000logos.net/wp-content/uploads/2017/08/Pixar-emblem.jpg");
                    uStmt.run("Marvel", "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Marvel_Logo.svg/1200px-Marvel_Logo.svg.png");
                    uStmt.run("Star Wars", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Star_Wars_Logo.svg/1200px-Star_Wars_Logo.svg.png");
                    uStmt.run("Warner Brothers", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Warner_Bros_logo.svg/1200px-Warner_Bros_logo.svg.png");
                    uStmt.finalize(() => {
                        console.log("[db] Universes inicializados.");
                        resolve();
                    });
                }
            });
        });
    });
};

runMigration().then(() => {
    console.log("[db] Migración de universos finalizada.");
    db.close();
});
