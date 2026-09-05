import express from "express";
import pg from "pg";

import { renderPage } from "./render.js";

const PORT = Number(process.env.PORT ?? 8080);
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL, max: 5 });

async function createSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id         BIGSERIAL PRIMARY KEY,
      title      TEXT        NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

pool.on("error", (error) => console.error("idle database connection error", error));

const app = express();
app.disable("x-powered-by");
app.use(express.urlencoded({ extended: false }));

app.get("/healthz", (_req, res) => {
  res.type("text/plain").send("ok");
});

app.get("/", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, title FROM todos ORDER BY created_at DESC, id DESC",
    );
    res.type("html").send(renderPage(rows));
  } catch (error) {
    next(error);
  }
});

app.post("/add", async (req, res, next) => {
  try {
    const title = (typeof req.body?.title === "string" ? req.body.title : "").trim();
    if (title) {
      await pool.query("INSERT INTO todos (title) VALUES ($1)", [
        Array.from(title).slice(0, 200).join(""),
      ]);
    }
    res.redirect(303, "/");
  } catch (error) {
    next(error);
  }
});

app.post("/delete", async (req, res, next) => {
  try {
    const id = Number(req.body.id);
    if (Number.isSafeInteger(id)) {
      await pool.query("DELETE FROM todos WHERE id = $1", [id]);
    }
    res.redirect(303, "/");
  } catch (error) {
    next(error);
  }
});

// Retry on startup so the app survives PostgreSQL not being ready yet.
async function start() {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await createSchema();
      break;
    } catch (error) {
      if (attempt >= 30) throw error;
      console.warn(`database not ready (attempt ${attempt}): ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`listening on 0.0.0.0:${PORT}`);
  });

  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, () => {
      server.close(() => {
        pool.end().finally(() => process.exit(0));
      });
    });
  }
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
