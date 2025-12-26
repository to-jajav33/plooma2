import { clean } from "./DBBackend";
import { DBQueryOperators } from "./DBQueryOperators";
import { DBColumnTypes } from "./DBColumnTypes";

export class DBTable {
	/** @type {import("./DBBackend").DBBackend} */
	#db!: import("./DBBackend").DBBackend;

	/**
	 *
	 *
	 * @param {import("./DBBackend").DBBackend} paramDB
	 * @memberof Table
	 */
	create (paramDB: import("./DBBackend").DBBackend) {
		const tableName = this.tableName;

		const columnsSchema = {} as Record<string, this[keyof this]>;
		for (const prop in this) {
			columnsSchema[prop] = this[prop as keyof this];
			(this as Record<string, unknown>)[prop] = undefined;
		}

		if (paramDB) {
			const db = this.db(paramDB as import("./DBBackend").DBBackend).open();
			using _inst = db.instance;
			const columns = Object.keys(columnsSchema)
				.map((columnName) => {
					columnName = DBTable.clean(columnName);
					return `${columnName} ${columnsSchema[columnName]}`;
				})
				.filter(item => !!item);
			
				"id integer PRIMARY KEY AUTOINCREMENT, uid CHAR(255) NOT NULL UNIQUE, FOREIGN KEY(uid) REFERENCES TableUserPrivate(uid), username CHAR(255) UNIQUE, createdAt date, refreshToken CHAR(255) UNIQUE, isEmailVerified integer, role CHECK(role IN (\"admin\",\"user\"))"
			console.log(columns.join(', '));
			db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(', ')})`);
		}
	}

	get operators () {
		return new DBQueryOperators();
	}

	get tableName() {
		return DBTable.clean(this.constructor.name || "")
	}

	static get type () {
		return new DBColumnTypes();
	}

	static clean (str: string) {
		return clean(str);
	}

	/**
	 *
	 *
	 * @param {import("./DBBackend").DBBackend[]} args
	 * @return {import("./DBBackend").DBBackend}
	 * @memberof Table
	 */
	db (...args: import("./DBBackend").DBBackend[]): import("./DBBackend").DBBackend {
		if (args.length) this.#db = args[0] as import("./DBBackend").DBBackend;

		return this.#db;
	}

	/**
	 * 
	 * @param {DBQueryOperators} queryOps 
	 * @returns 
	 */
	all (queryOps: DBQueryOperators) {
		if (!queryOps.queue.length) return [];

		const db = this.#db.open();
		using _inst = db.instance;
		using query = db.query(`SELECT * FROM ${this.tableName} WHERE ${queryOps.generate()}`).as(this.constructor as new (...args: any[]) => unknown);
		const all = query.all();

		return all;
	}

	/**
	 * 
	 * @param {DBQueryOperators} queryOps 
	 * @returns {unknown}
	 */
	first (queryOps: DBQueryOperators) {
		if (!queryOps.queue.length) return;

		const db = this.#db.open();
		using _inst = this.#db.instance;
		using query = db.query(`SELECT * FROM ${this.tableName} WHERE ${queryOps.generate()}`).as(this.constructor as new (...args: any[]) => unknown);
		const first = query.get();

		return first;
	}

	/**
	 * 
	 * @param {Record<string, unknown>} vals 
	 * @returns 
	 */
	insert (vals: Record<string, unknown>) {
		try {
			const valColumns = vals ? Object.keys(vals) : [];
			if (!valColumns.length) return;
			
			const db = this.#db.open();
			using _inst = db.instance;
			const qStr = `INSERT INTO ${this.tableName} (${valColumns.map(key => `${key}`).join(", ")}) VALUES(${valColumns.map(key => `"${vals[key] && typeof vals[key] === "object" ? JSON.stringify(vals[key]) : vals[key]}"`).join(", ")})`;
			using query = db.query(qStr);
			const result = query.run();

			const qOps = new DBQueryOperators();
			return this.first(qOps.equals("id", result.lastInsertRowid as string | number | boolean | null | undefined));
		} catch (e: any) {
			console.log(e.message); // => BigInt value '81129638414606663681390495662081' is out of range
			throw(e);
		}
	}

	/**
	 * 
	 * @param {Record<string, unknown>} setVals 
	 * @returns 
	 */
	update (setVals: Record<string, unknown>, whereVals: Record<string, unknown>) {
		try {
			const valColumns = setVals ? Object.keys(setVals) : [];
			if (!valColumns.length) return;
			const whereKeys = Object.keys(whereVals);
			const where = whereKeys.map(key => `${key} = "${whereVals[key] && typeof whereVals[key] === "object" ? JSON.stringify(whereVals[key]) : whereVals[key]}"`).join(", ");
			const set = valColumns.map(key => `${key} = "${setVals[key]}"`).join(", ");
			
			const db = this.#db.open();
			using _inst = db.instance;
			const qStr = `UPDATE ${this.tableName} SET ${set} WHERE ${where} RETURNING *`;
			using query = db.query(qStr);
			const result = query.all();
			return result;
		} catch (e: any) {
			console.log(e.message); // => BigInt value '81129638414606663681390495662081' is out of range
			throw(e);
		}
	}

	delete (queryOps: DBQueryOperators) {
		if (!queryOps.queue.length) return [];

		const db = this.#db.open();
		using _inst = db.instance;
		using query = db.query(`DELETE FROM ${this.tableName} WHERE ${queryOps.generate()}`).as(this.constructor as new (...args: any[]) => unknown);
		const result = query.run();

		return result;
	}
}