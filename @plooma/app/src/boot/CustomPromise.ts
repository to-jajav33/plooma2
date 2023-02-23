/* eslint-disable @typescript-eslint/no-unused-vars */
type CustomPromiseOptions = ((resolve?: (value?: unknown) => void, reject?: (reason?: unknown) => void, cancel?: (value: unknown) => void) => void) | number;
type CustomPromiseStates = 'fulfilled' | 'pending' | 'rejected' | 'cancelled';
type CustomPromiseCallback = (...args: unknown[]) => unknown;
type CustomPromiseCallbacks = CustomPromiseCallback[];

/**
 * Like a Promise but:
 * 1. can be cancelled 
 * 	- (Cancelling by default resolves, update this.cancelShould = 'Reject' otherwise)
 * 2. passing in a number will create setTimeout that resolves a promise.
 * 3. Passing in nothing creates an empty promise that you can call this.forceResolve to resolve it at any moment.
 *  - (Good for converting listeners to promises)
 *
 * @export
 * @class CustomPromise
 */
export class CustomPromise {
    _cancelPromise: Promise<unknown>;
    _origPromise: Promise<unknown>;
    forceResolve: (value?: unknown) => Promise<unknown>|CustomPromise;
    forceReject: (reason?: unknown) => Promise<unknown>|CustomPromise;
    forceCancel: (reason?: unknown) => Promise<unknown>|CustomPromise;
    _onfulfilled: CustomPromiseCallbacks;
    _onrejected: CustomPromiseCallbacks;
    _oncancelled: CustomPromiseCallbacks;
    _finallyArr: CustomPromiseCallbacks;
    _timeout: NodeJS.Timeout | undefined;
    state: CustomPromiseStates;
    cancelShould: 'Resolve' | 'Reject';


	constructor(fnOrNumber?: CustomPromiseOptions) {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		let _resolve = (_value?: unknown) => {};
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		let _reject = (_reason?: unknown) => {};
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		let _cancel = (_value?: unknown) => {};

		this._cancelPromise = new Promise((resolve) => { _cancel = resolve; });
		this._origPromise = new Promise((resolve, reject) => {
			_resolve = resolve;
			_reject = reject;
		});

		this.forceResolve = async (...args) => { 
			const result = _resolve(...args) as unknown;
			if (result instanceof Promise) return result;
			else return this;
		}
		this.forceReject = async (...args) => { 
			const result = _reject(...args) as unknown;
			if (result instanceof Promise) return result;
			else return this;
		}
		this.forceCancel = async (...args) => { 
			const result = _cancel(...args) as unknown;
			if (result instanceof Promise) return result;
			else return this;
		}

		this._onfulfilled = [];
		this._onrejected = [];
		this._oncancelled = [];
		this._finallyArr = [];
		this._timeout;
		this.state = 'pending';
		this.cancelShould = 'Resolve';

		const handleProm = (state: CustomPromiseStates, ...args: unknown[]) => {
			if (this.state !== 'pending') return;

            if (this._timeout !== undefined) clearTimeout(this._timeout);

			this.state = state;

			
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this[`_argsFor_${state}`] = args;

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const arr: CustomPromiseCallbacks = this[`_on${state}`] as CustomPromiseCallbacks;
			for (const fn of arr) {
				if (typeof fn === 'function') fn(...args);
			}

			for (const fn of this._finallyArr) {
				if (typeof fn === 'function') fn(...args);
			}

			if (state === 'cancelled') {
				void this[`force${this.cancelShould}`](); // cancel should also call resolve with nothing in the params
			} else {
				void this.forceCancel();
			}

			// promisesavoid memory leaks
			this._onfulfilled = [];
			this._onrejected = [];
			this._oncancelled = [];
		};

		void this._origPromise.then((...args) => {
			handleProm('fulfilled', ...args);
		});
		this._origPromise.catch((...args) => {
			handleProm('rejected', ...args);
		});
		void this._cancelPromise.then((...args) => {
			handleProm('cancelled', ...args);
		});

		if (fnOrNumber !== undefined && (typeof fnOrNumber !== 'function' && !isNaN(fnOrNumber))) {
			try {
				this._timeout = setTimeout(() => void this.forceResolve, Number(fnOrNumber));
			} catch (e) {
				console.error(e);
			}
		} else if (typeof fnOrNumber === 'function') {
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			fnOrNumber(this.forceResolve, this.forceReject, this.forceCancel);
		}
	}

	/**
	 * then<any, never>(
	 *
	 * @param {((value: any) => any) | null | undefined} onfulfilled on
	 * @param {((reason: any) => PromiseLike<never>) | null | undefined} onrejected on
	 * @param {((value: any) => any) | null | undefined} oncancelled on
	 * 
	 * @return {Promise<any>} any
	 * @memberof CustomPromise
	 */
	then(onfulfilled: CustomPromiseCallback, onrejected: CustomPromiseCallback, oncancelled: CustomPromiseCallback) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const args: unknown[] = (this[`_argsFor_${this.state}`] || []) as unknown[];

        if (typeof onfulfilled === 'function') {
			if (this.state === 'fulfilled') {
				onfulfilled(...args)
			} else if (this.state === 'pending') {
				this._onfulfilled.push(onfulfilled);
			}
		}
		if (typeof onrejected === 'function') {
			if (this.state === 'rejected') {
				onrejected(...args);
			} else if (this.state === 'pending') {
				this._onrejected.push(onrejected);
			}
		}
		if (typeof oncancelled === 'function') {
			if (this.state === 'rejected') {
				oncancelled(...args);
			} else if (this.state === 'pending') {
				this._oncancelled.push(oncancelled);
			}
		}

		return this;
	}

	finally(onfinally: CustomPromiseCallback) {
		if (typeof onfinally === 'function') this._finallyArr.push(onfinally);

		return this;
	}

	catch(onrejected: CustomPromiseCallback) {
		if (typeof onrejected === 'function') this._onrejected.push(onrejected);
	}
}
