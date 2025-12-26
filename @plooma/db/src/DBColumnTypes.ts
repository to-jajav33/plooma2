import { clean } from "./DBBackend";

export class DBColumnTypes {
    queue: string[] = [];
    _foreignKey: string | undefined;

	constructor (append: string[] = []) {
		this.queue = [...append]
	}

	clone () { return new DBColumnTypes(this.queue); }

	generate () { return `${this.queue.join(" ")}${this._foreignKey ? `, ${this._foreignKey}` : ""}`; }
	
	autoIncrement () { if (this.queue.includes("NOT NULL") || this.queue.includes("UNIQUE")) throw (new Error("Invalid Arguments with autoincrement")); this.queue.push(`AUTOINCREMENT`); return this; }
	foreignKey (tableName: string, columnName: string, prop: string | undefined) { this._foreignKey = (`FOREIGN KEY(${clean(prop || columnName)}) REFERENCES ${clean(tableName)}(${clean(columnName)})`); return this; }
	minMaxStr (columnName: string, min: number, max: number) { this.queue.push(`CHECK(LENGTH(${clean(columnName)})<=${Number(max)} AND LENGTH(${clean(columnName)})>=${Number(min)})`); return this; }
	minMaxNumber (columnName: string, min: number, max: number) { this.queue.push(`CHECK(${clean(columnName)}<=${Number(max)} AND ${clean(columnName)}>=${Number(min)})`); return this; }
	enumString (columnName: string, enums: string[]) { this.queue.push(`CHECK(${clean(columnName)} IN (${enums.map(item => `"${item}"`).join(",")}))`); return this; }
	notNull () { this.queue.push(`NOT NULL`); return this; }
	primaryKey (...args: string[]) { this.queue.push(`${args.length? `PRIMARY KEY(${args[0]})`: `PRIMARY KEY`}`); return this; }
	unique() { this.queue.push(`UNIQUE`); return this; }

	char (n = 1) { this.queue.push(`CHAR(${Number(n)})`); return this; }
	varchar (n = 0) { this.queue.push(`VARCHAR(${Number(n)})`); return this; }
	text () { this.queue.push("TEXT"); return this; }
	nchar () { this.queue.push("NCHAR"); return this; }
	nvarchar (max: number) { this.queue.push(`NVARCHAR(${Number(max)})`); return this; }
	ntext () { this.queue.push("NTEXT"); return this; }
	binary (n: number) { this.queue.push(`BINARY(${Number(n)})`); return this; }
	varbinary (max: number) { this.queue.push(`VARBINARY(${Number(max)})`); return this; }
	image () { this.queue.push("IMAGE"); return this; }
	bit () { this.queue.push("bit"); return this; }											// Integer that can be 0, 1, or NULL	 
	tinyint () { this.queue.push("tinyint"); return this; }									// Allows whole numbers from 0 to 255	1 byte
	smallint () { this.queue.push("smallint"); return this; }									// Allows whole numbers between -32,768 and 32,767	2 bytes
	int () { this.queue.push("integer"); return this; }											// Allows whole numbers between -2,147,483,648 and 2,147,483,647	4 bytes
	bigint () { this.queue.push("bigint"); return this; }										// Allows whole numbers between -9,223,372,036,854,775,808 and 9,223,372,036,854,775,807	8 bytes
	decimal (p: number, s: number) { this.queue.push(`decimal(${Number(p)},${Number(s)})`); return this; }	// (p,s) Fixed precision and scale numbers. Allows numbers from -10^38 +1 to 10^38 –1.
																				// The p parameter indicates the maximum total number of digits that can be stored (both to the left and to the right of the decimal point). p must be a value from 1 to 38. Default is 18.
																				// The s parameter indicates the maximum number of digits stored to the right of the decimal point. s must be a value from 0 to p. Default value is 0
																				// 5-17 bytes
	smallmoney () { this.queue.push("smallmoney"); return this; }								// Monetary data from -214,748.3648 to 214,748.3647	4 bytes
	money () { this.queue.push("money"); return this; }										// Monetary data from -922,337,203,685,477.5808 to 922,337,203,685,477.5807	8 bytes
	float (n: number) { this.queue.push(`float(${Number(n)})`); return this; }						// Floating precision number data from -1.79E + 308 to 1.79E + 308.
																				// The n parameter indicates whether the field should hold 4 or 8 bytes. float(24) holds a 4-byte field and float(53) holds an 8-byte field. Default value of n is 53.
																				// 4 or 8 bytes
	real () { this.queue.push("real"); return this; }											// Floating precision number data from -3.40E + 38 to 3.40E + 38
	
	datetime () { this.queue.push("datetime"); return this; }									// From January 1, 1753 to December 31, 9999 with an accuracy of 3.33 milliseconds	8 bytes
	datetime2 () { this.queue.push("datetime2"); return this; }								// From January 1, 0001 to December 31, 9999 with an accuracy of 100 nanoseconds	6-8 bytes
	smalldatetime () { this.queue.push("smalldatetime"); return this; }						// From January 1, 1900 to June 6, 2079 with an accuracy of 1 minute	4 bytes
	date () { this.queue.push("date"); return this; }											// Store a date only. From January 1, 0001 to December 31, 9999	3 bytes
	time () { this.queue.push("time"); return this; }											// Store a time only to an accuracy of 100 nanoseconds	3-5 bytes
	datetimeoffset () { this.queue.push("datetimeoffset"); return this; }						// The same as datetime2 with the addition of a time zone offset	8-10 bytes
	timestamp () { this.queue.push("timestamp"); return this; }
}