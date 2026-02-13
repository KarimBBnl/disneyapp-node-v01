import { createDb } from "./db.js";
import { createApp } from "./app.js";

const PORT = 3000;

const db = createDb();
const app = createApp(db);

app.listen(PORT, () => {
    console.log(`[api] http://localhost:${PORT}`);
});
