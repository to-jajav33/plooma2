import { hashPassword } from "@plooma/auth";
import { DBBackend } from "@plooma/db";
import { User } from "../../../tables/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    // Validate input
    if (!username || !email || !password) {
      return Response.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Initialize database
    const dbName = process.env.DB_NAME || "plooma";
    const db = new DBBackend(dbName);
    const userTable = new User();
    userTable.create(db);

    // Check if user already exists
    const existingUserQuery = db.query(
      `SELECT * FROM ${userTable.tableName} WHERE email = ? OR username = ?`
    );
    const existingUser = existingUserQuery.get(email, username) as any;

    if (existingUser) {
      return Response.json(
        { error: "User with this email or username already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const now = new Date().toISOString();
    const insertResult = db.run(
      `INSERT INTO ${userTable.tableName} (username, email, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
      [username, email, passwordHash, now, now]
    ) as any;

    // Get the created user using rowid (SQLite's auto-increment)
    const newUserQuery = db.query(
      `SELECT rowid as id, username, email, createdAt FROM ${userTable.tableName} WHERE email = ?`
    );
    const newUser = newUserQuery.get(email) as any;

    return Response.json(
      {
        message: "User created successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
