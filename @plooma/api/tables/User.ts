import { DBTable } from "@plooma/db/";

export class User extends DBTable {
  username = DBTable.type.varchar(255).notNull().unique();
  email = DBTable.type.varchar(255).notNull().unique();
  passwordHash = DBTable.type.varchar(255).notNull();
  createdAt = DBTable.type.datetime().notNull();
  updatedAt = DBTable.type.datetime().notNull();
}

