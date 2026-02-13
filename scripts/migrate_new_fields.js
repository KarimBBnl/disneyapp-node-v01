import sqlite3 from "sqlite3";

const db = new sqlite3.Database("data/disney.sqlite");

const runMigration = () => {
    return new Promise((resolve) => {
        db.serialize(() => {
            // Edad Mínima
            db.run("ALTER TABLE movies ADD COLUMN edad_minima INTEGER DEFAULT 0", (err) => {
                if (err) console.log("[db] Columna 'edad_minima' ya existe o error:", err.message);
                else console.log("[db] Columna 'edad_minima' añadida.");
            });

            // Actores
            db.run("ALTER TABLE movies ADD COLUMN actores TEXT DEFAULT ''", (err) => {
                if (err) console.log("[db] Columna 'actores' ya existe o error:", err.message);
                else console.log("[db] Columna 'actores' añadida.");
                resolve();
            });
        });
    });
};

runMigration().then(() => {
    console.log("[db] Migración completada.");
    db.close();
});
