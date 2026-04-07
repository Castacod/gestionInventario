import { MongoClient, Db, Collection } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoDb(): Promise<Db> {
  if (db) return db;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }
  client = new MongoClient(uri);
  await client.connect();
  const name = process.env.MONGODB_DB_NAME ?? "academic_demo";
  db = client.db(name);
  return db;
}

export type AuditLogDoc = {
  _id?: import("mongodb").ObjectId;
  action: string;
  userId?: string;
  detail: Record<string, unknown>;
  createdAt: Date;
};

export async function auditLogs(): Promise<Collection<AuditLogDoc>> {
  const database = await getMongoDb();
  return database.collection<AuditLogDoc>("audit_logs");
}
