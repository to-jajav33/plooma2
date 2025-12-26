import { clean } from "./DBBackend";

/**
 * @template T
 */
export class DBQueryOperators {
	#queue: string[] = [];
	
	constructor(arr = []) {
		this.#queue = [...arr];
	}

	get queue () {
		return this.#queue.concat();
	}

	generate () {
		return this.#queue.join(" ")
	}

	and () {
		this.#queue.push("AND");
		return this;
	}

	or () {
		this.#queue.push("OR");
		return this;
	}

	/**
	 *
	 *
	 * @param {keyof T} id
	 * @param {*} val
	 * @return {DBQueryOperators} 
	 * @memberof DBQueryOperators
	 */
	equals (id: string, val: string | number | boolean | null | undefined) {
		this.#queue.push(`${clean(id)}="${clean(String(val))}"`);
		return this;
	}

	groupStart () {
		this.#queue.push("(");
		return this;
	}

	groupEnd () {
		this.#queue.push(")");
		return this;
	}

	/**
	 *
	 *
	 * @param {keyof T} id
	 * @param {*} val
	 * @return {DBQueryOperators} 
	 * @memberof DBQueryOperators
	 */
	greaterThan (id: string, val: string | number | boolean | null | undefined) {
		this.#queue.push(`${clean(id)}>${clean(String(val))}`);
		return this;
	}

	/**
	 *
	 *
	 * @param {keyof T} id
	 * @param {*} val
	 * @return {DBQueryOperators} 
	 * @memberof DBQueryOperators
	 */
	greaterThanEqualTo (id: string, val: string | number | boolean | null | undefined) {
		this.#queue.push(`${clean(id)}>=${clean(String(val))}`);
		return this;
	}

	/**
	 *
	 *
	 * @param {keyof T} id
	 * @param {*} val
	 * @return {DBQueryOperators} 
	 * @memberof DBQueryOperators
	 */
	lessThan (id: string, val: string | number | boolean | null | undefined) {
		this.#queue.push(`${clean(id)}<${clean(String(val))}`);
		return this;
	}

	/**
	 *
	 *
	 * @param {keyof T} id
	 * @param {*} val
	 * @return {DBQueryOperators} 
	 * @memberof DBQueryOperators
	 */
	lessThanEqualTo (id: string, val: string | number | boolean | null | undefined) {
		this.#queue.push(`${clean(id)}<=${clean(String(val))}`);
		return this;
	}
}