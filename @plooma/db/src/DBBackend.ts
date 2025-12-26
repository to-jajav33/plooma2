import { constants, Database } from "bun:sqlite";

export function clean(str: string) {
	return str.replace(/\s/g, "").replace(/;/g, "");
}

export class DBBackend {
	#dbname = "";

	/** @type {Database} */
	#db!: Database;

	constructor(dbName: string) {
		this.#dbname = dbName;
		this.open()
	}

	get instance () {
		return this.#db;
	}

	clean(str: string) {
		return clean(str);
	}

	open () {
		if (!this.#dbname) throw (new Error("Database does not exist"));

		const dbName = this.#dbname;
		const db = new Database(
			`./${dbName}.sqlite`, 
			{ strict: true, create: true }
		);

		// https://bun.sh/docs/api/sqlite#wal-mode
		db.exec("PRAGMA journal_mode = WAL;");
		db.fileControl(constants.SQLITE_FCNTL_PERSIST_WAL, 0);

		// db.run("CREATE TABLE foo (bar TEXT)");
		// db.run("INSERT INTO foo VALUES (?)", ["baz"]);

		this.#db = db;

		return this;
	}

	query (sqlQuery: string) {
		return this.#db.query(sqlQuery);
	}

	run (sqlQuery: string, ...bindings: any[]) {
		return this.#db.run(sqlQuery, ...bindings);
	}
}