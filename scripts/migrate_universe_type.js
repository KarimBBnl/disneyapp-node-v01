import sqlite3 from "sqlite3";

const db = new sqlite3.Database("data/disney.sqlite");

const runMigration = () => {
    return new Promise((resolve) => {
        db.serialize(() => {
            console.log("[db] Iniciando migración para 'universe' y 'type'...");

            // Universe
            db.run("ALTER TABLE movies ADD COLUMN universe TEXT DEFAULT ''", (err) => {
                if (err) {
                    if (err.message.includes("duplicate column name")) {
                        console.log("[db] La columna 'universe' ya existe.");
                    } else {
                        console.error("[db] Error añadiendo columna 'universe':", err.message);
                    }
                } else {
                    console.log("[db] Columna 'universe' añadida.");
                }
            });

            // Type
            db.run("ALTER TABLE movies ADD COLUMN type TEXT DEFAULT ''", (err) => {
                if (err) {
                    if (err.message.includes("duplicate column name")) {
                        console.log("[db] La columna 'type' ya existe.");
                    } else {
                        console.error("[db] Error añadiendo columna 'type':", err.message);
                    }
                } else {
                    console.log("[db] Columna 'type' añadida.");
                }
                resolve();
            });
        });
    });
};

runMigration().then(() => {
    console.log("[db] Migración finalizada.");
    db.close();
});
