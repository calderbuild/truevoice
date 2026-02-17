import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDb() {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      address TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_id TEXT NOT NULL REFERENCES entities(id),
      wallet_address TEXT NOT NULL,
      nullifier_hash TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      text TEXT NOT NULL,
      review_hash TEXT NOT NULL,
      tx_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entity_id, nullifier_hash)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_reviews_entity ON reviews(entity_id)`,
    `CREATE INDEX IF NOT EXISTS idx_reviews_wallet ON reviews(wallet_address)`,
  ]);
}

// Seed data: Cannes local entities
const SEED_ENTITIES = [
  {
    id: "cannes-la-pizza-cresci",
    name: "La Pizza Cresci",
    category: "restaurant",
    address: "26 Rue du Commandant Andre, Cannes",
  },
  {
    id: "cannes-le-suquet",
    name: "Le Suquet (Old Town)",
    category: "attraction",
    address: "Le Suquet, 06400 Cannes",
  },
  {
    id: "cannes-palais-des-festivals",
    name: "Palais des Festivals",
    category: "attraction",
    address: "1 Bd de la Croisette, 06400 Cannes",
  },
  {
    id: "cannes-la-croisette",
    name: "Boulevard de la Croisette",
    category: "attraction",
    address: "Boulevard de la Croisette, Cannes",
  },
  {
    id: "cannes-marche-forville",
    name: "Marche Forville",
    category: "restaurant",
    address: "6 Rue du Marche Forville, Cannes",
  },
  {
    id: "ethglobal-cannes-2026",
    name: "ETHGlobal Cannes 2026",
    category: "event",
    address: "Palais des Festivals, Cannes",
  },
];

export async function seedEntities() {
  for (const entity of SEED_ENTITIES) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO entities (id, name, category, address) VALUES (?, ?, ?, ?)`,
      args: [entity.id, entity.name, entity.category, entity.address],
    });
  }
}
