import sqlite3 from "sqlite3";

const db = new sqlite3.Database("data/disney.sqlite");

// 1. Añadir columna youtube_url si no existe
const addColumn = () => {
    return new Promise((resolve) => {
        db.run("ALTER TABLE movies ADD COLUMN youtube_url TEXT", (err) => {
            if (err) {
                if (err.message.includes("duplicate column name")) {
                    console.log("[db] La columna 'youtube_url' ya existe.");
                } else {
                    console.error("[db] Error añadiendo columna:", err.message);
                }
            } else {
                console.log("[db] Columna 'youtube_url' añadida con éxito.");
            }
            resolve();
        });
    });
};

// 2. Datos pre-rellenados para que pongas tus links de YouTube
// Pon el link completo o solo el ID del video si prefieres (el frontend lo manejará)
const movieUpdates = [
    { slug: "the_lion_king", url: "https://www.youtube.com/watch?v=4sj1MT05lAA" },
    { slug: "aladdin", url: "https://www.youtube.com/watch?v=-G5XI61Y9ms" },
    { slug: "moana", url: "https://www.youtube.com/watch?v=LKFuXETZUsI" },
    { slug: "matrix", url: "https://www.youtube.com/watch?v=vKQi3bBA1y8" },
    { slug: "inception", url: "https://www.youtube.com/watch?v=YoHD9XEInc0" },
    { slug: "titanic", url: "https://www.youtube.com/watch?v=2e-eXJ6HgkQ" },
    { slug: "gladiator", url: "https://www.youtube.com/watch?v=owK1qxDselE" },
    { slug: "avatar", url: "https://www.youtube.com/watch?v=5PSNL1qE6VY" },
    { slug: "jaws", url: "https://www.youtube.com/watch?v=U1fu_sA7XhE" },
    { slug: "rocky", url: "https://www.youtube.com/watch?v=3VUblDwa648" },
    { slug: "alien", url: "https://www.youtube.com/watch?v=jQ5lPt9edzQ" },
    { slug: "up", url: "https://www.youtube.com/watch?v=pkqzFUhGPJg" },
    { slug: "coco", url: "https://www.youtube.com/watch?v=Rvr68u6k5sI" },
    { slug: "shrek", url: "https://www.youtube.com/watch?v=CwXOrWvPBPk" },
    { slug: "amelie", url: "https://www.youtube.com/watch?v=HUECWi5pX7o" },
    { slug: "batman_begins", url: "https://www.youtube.com/watch?v=neY2xVmOfUM" },
    { slug: "joker", url: "https://www.youtube.com/watch?v=zAGVQLHvwOY" },
    { slug: "pulp_fiction", url: "https://www.youtube.com/watch?v=s7EdQ4FqbhY" },
    { slug: "forrest_gump", url: "https://www.youtube.com/watch?v=bLvqoHBptjg" },
    { slug: "interstellar", url: "https://www.youtube.com/watch?v=zSWdZVtXT7E" },
    { slug: "la_la_land", url: "https://www.youtube.com/watch?v=0pdqf4P9MB8" },
    { slug: "mad_max_fury_road", url: "https://www.youtube.com/watch?v=hEJnMQG9ev8" },
    { slug: "toy_story", url: "https://www.youtube.com/watch?v=KYz2wyBy3kc" },
    { slug: "it", url: "https://www.youtube.com/watch?v=FnCdOQsX5kc" },
    { slug: "the_notebook", url: "https://www.youtube.com/watch?v=FC6biTjEyZw" },
    { slug: "braveheart", url: "https://www.youtube.com/watch?v=1NJO0jxBtMo" },
    { slug: "saving_private_ryan", url: "https://www.youtube.com/watch?v=zwhP5b4tD6g" },
    { slug: "indiana_jones", url: "https://www.youtube.com/watch?v=0xQSIdSRlAk" },
    { slug: "the_conjuring", url: "https://www.youtube.com/watch?v=k10ETZ41q5o" },
    { slug: "wall_e", url: "https://www.youtube.com/watch?v=alIq_wG9FNk" },
    { slug: "the_good_the_bad_and_the_ugly", url: "https://www.youtube.com/watch?v=WCN5JJY_wiA" },
    { slug: "finding_nemo", url: "https://www.youtube.com/watch?v=SPHfeNgogVs" },
    { slug: "frozen", url: "https://www.youtube.com/watch?v=TbQm5doF_Uc" }
]
    ;

const updateMovies = async () => {
    await addColumn();

    console.log("[db] Actualizando URLs de YouTube...");

    let updatedCount = 0;
    for (const movie of movieUpdates) {
        if (movie.url) {
            await new Promise((resolve) => {
                db.run(
                    "UPDATE movies SET youtube_url = ? WHERE name_slug = ?",
                    [movie.url, movie.slug],
                    (err) => {
                        if (err) console.error(`[db] Error actualizando ${movie.slug}:`, err.message);
                        else updatedCount++;
                        resolve();
                    }
                );
            });
        }
    }

    console.log(`[db] Proceso terminado. Se han actualizado ${updatedCount} películas.`);
    db.close();
};

updateMovies();
