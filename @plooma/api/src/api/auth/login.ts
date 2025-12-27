import { verifyPassword, createToken } from "@plooma/auth";
import { DBBackend } from "@plooma/db";
import { User } from "../../../tables/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Initialize database
    const dbName = process.env.DB_NAME || "temp";
    const db = new DBBackend(dbName);
    const userTable = new User();
    userTable.create(db);

    // Find user by email
    const userQuery = db.query(
      `SELECT * FROM ${userTable.tableName} WHERE email = ?`
    );
    const user = userQuery.get(email) as any;

    if (!user) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create JWT token (use rowid as userId since SQLite uses rowid)
    const userId = (user as any).rowid || (user as any).id;
    const token = createToken({
      userId,
      username: user.username,
      email: user.email,
    });

    return Response.json({
      message: "Login successful",
      token,
      user: {
        id: userId,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
