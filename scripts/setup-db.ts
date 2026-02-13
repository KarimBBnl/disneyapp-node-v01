import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data/disney.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Setting up database at:", dbPath);

db.serialize(() => {
    // Drop table to ensure schema update
    db.run(`DROP TABLE IF EXISTS movies`, (err) => {
        if (err) {
            console.error("Error dropping table:", err);
            return;
        }
        console.log("Dropped existing movies table.");

        // Create specific movies table
        db.run(`CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            name_slug TEXT NOT NULL,
            year INTEGER,
            description TEXT,
            genres TEXT,
            youtube_url TEXT,
            edad_minima INTEGER DEFAULT 0,
            actores TEXT DEFAULT '',
            universe TEXT DEFAULT '',
            type TEXT DEFAULT ''
        )`, (err) => {
            if (err) {
                console.error("Error creating table:", err);
                return;
            }
            console.log("Created movies table.");

            // Insert sample data
            const stmt = db.prepare("INSERT INTO movies (title, name_slug, year, description, genres, youtube_url, edad_minima, actores, universe, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            console.log("Inserting sample movies with slugs and genres...");

            stmt.run(
                "The Lion King",
                "the_lion_king",
                1994,
                "Un joven león llamado Simba es el heredero al trono de la sabana africana. Sin embargo, su malvado tío Scar, consumido por la envidia, trama un siniestro plan para usurpar el reino. Tras una tragedia que obliga a Simba a huir y exiliarse, el joven príncipe crece lejos de su hogar. Pero el destino lo obliga a regresar para desafiar a Scar y recuperar su lugar legítimo en el ciclo de la vida.",
                "Animación, Drama, Musical",
                "https://www.youtube.com/watch?v=4sj1MT05lAA",
                0,
                "Matthew Broderick, Jeremy Irons, James Earl Jones",
                "Disney",
                "Movie"
            );

            stmt.run(
                "Frozen",
                "frozen",
                2013,
                "Cuando una profecía condena al reino de Arendelle a un invierno eterno, la intrépida Anna emprende un viaje épico. Junto al hombre de montaña Kristoff y su leal reno Sven, busca a su hermana Elsa, cuyos poderes de hielo han atrapado al reino. En su camino, se encontrarán con trolls místicos y un divertido muñeco de nieve llamado Olaf, luchando contra los elementos para salvar su reino.",
                "Animación, Aventura, Fantasía",
                "https://www.youtube.com/watch?v=TbQm5doF_Uc",
                0,
                "Kristen Bell, Idina Menzel, Josh Gad",
                "Disney",
                "Movie"
            );

            stmt.run(
                "Aladdin",
                "aladdin",
                1992,
                "Aladdin es un ingenioso joven que vive en las calles de Agrabah y sueña con una vida mejor. Su destino cambia cuando descubre una lámpara mágica con un Genio capaz de conceder tres deseos. Con su ayuda, Aladdin intenta conquistar a la princesa Jasmine y enfrentarse al malvado Jafar, quien busca la lámpara para gobernar el reino. Una aventura llena de magia y valentía.",
                "Animación, Fantasía, Musical",
                "https://www.youtube.com/watch?v=-G5XI61Y9ms",
                0,
                "Scott Weinger, Robin Williams, Linda Larkin",
                "Disney",
                "Movie"
            );

            stmt.run(
                "Moana",
                "moana",
                2016,
                "En la antigua Polinesia, Moana, la audaz hija del jefe de la tribu, se embarca en una misión para salvar a su pueblo. Cuando una maldición amenaza su isla, responde al llamado del océano para buscar al semidiós Maui. Juntos cruzarán el océano en un viaje lleno de acción, enfrentándose a enormes criaturas y desafíos imposibles, descubriendo en el proceso su propia identidad.",
                "Animación, Aventura, Infantil / Familiar",
                "https://www.youtube.com/watch?v=LKFuXETZUsI",
                0,
                "Auli'i Cravalho, Dwayne Johnson, Rachel House",
                "Disney",
                "Movie"
            );

            stmt.finalize(() => {
                console.log("Movies inserted successfully!");

                // Create users table
                db.run(`CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    name TEXT NOT NULL
                )`, (err) => {
                    if (err) {
                        console.error("Error creating users table:", err);
                    } else {
                        console.log("Created users table.");
                    }

                    // Create favorites table
                    db.run(`CREATE TABLE IF NOT EXISTS favorites (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        movie_id INTEGER NOT NULL,
                        UNIQUE(user_id, movie_id),
                        FOREIGN KEY(user_id) REFERENCES users(id),
                        FOREIGN KEY(movie_id) REFERENCES movies(id)
                    )`, (err) => {
                        if (err) {
                            console.error("Error creating favorites table:", err);
                        } else {
                            console.log("Created favorites table.");
                        }

                        // Create universes table
                        db.run(`CREATE TABLE IF NOT EXISTS universes (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT UNIQUE NOT NULL,
                            image_url TEXT NOT NULL
                        )`, (err) => {
                            if (err) {
                                console.error("Error creating universes table:", err);
                            } else {
                                console.log("Created universes table.");

                                const uStmt = db.prepare("INSERT INTO universes (name, image_url) VALUES (?, ?)");
                                uStmt.run("Disney", "https://logodownload.org/wp-content/uploads/2020/11/disney-plus-logo-1.png");
                                uStmt.run("Pixar", "https://1000logos.net/wp-content/uploads/2017/08/Pixar-emblem.jpg");
                                uStmt.run("Marvel", "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Marvel_Logo.svg/1200px-Marvel_Logo.svg.png");
                                uStmt.run("Star Wars", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Star_Wars_Logo.svg/1200px-Star_Wars_Logo.svg.png");
                                uStmt.run("Warner Brothers", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Warner_Bros_logo.svg/1200px-Warner_Bros_logo.svg.png");
                                uStmt.finalize(() => {
                                    console.log("Universes inserted successfully!");
                                    db.close();
                                });
                            }
                        });
                    });
                });
            });
        });
    });
});
