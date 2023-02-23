/* eslint-disable @typescript-eslint/ban-ts-comment */

import Dexie from 'dexie';
import { reactive } from 'vue';
import { CustomPromise } from './CustomPromise';

let prefix = '';

function makeReactive<W>(define: W, proxyClass: Record<string, W>) {
  prefix = '__itzame__';

  return new Proxy(proxyClass, {
    get: (target: Record<string, W>, prop: string) => {
      if (typeof prop === 'symbol' || !prop.startsWith(prefix)) {
        // console.warn(
        //   prop,
        //   ' does not contain proper prefix. Use getter instead.'
        // );
        return target[prop];
      }

      prop = prop.replace(prefix, '');

      target[prop] = (target[prop] || JSON.parse(JSON.stringify(define))) as W;
      return target[prop];
    },
    set: (target: Record<string, W>, prop: string, newVal: W) => {
      if (prop.startsWith(prefix)) prop = prop.replace(prefix, '');
      target[prop] = newVal;
      return true;
    },
  });
}

type StoreSchema =
  | Record<string, unknown>
  | ((...args: unknown[]) => Record<string, unknown>);
export type StoreStateOptions = {
  mutations: Record<
    string,
    { get: () => Promise<unknown>; set: (arg: unknown) => Promise<void> }
  >;
  stateWrapper: StateWrapper;
  state: Record<string, unknown> | Array<unknown>;
};

const mapOfClasses = new Map();

export class CustomRecord {}

export type GetOptionsParams = {
  dbProm: Promise<{ db: Dexie; table: Dexie.Table }>;
  payload?: unknown;
} & StoreStateOptions;
export type TypeOfTypes = {
  getConvertType: () => unknown;
  getDefaultVal: () => unknown;
  type: keyof typeof types;
  currentPath: [];
  next?: Record<string, TypeOfTypes>;
};

export const types = {
  Array: <W>(define?: W) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const tempProxy = makeReactive(define, []);

    const proxy = reactive(tempProxy);

    return proxy as unknown as Array<W>;
  },
  Boolean: (define: boolean) => {
    return Number(define);
  },
  Class: <W extends { new (...args: unknown[]): InstanceType<W> }>(
    Class: W
  ): InstanceType<W> => {
    if (mapOfClasses.has(Class))
      return mapOfClasses.get(Class) as InstanceType<W>;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ExtendingClass = class CustomClass extends Class {};
    const newStateFactory = new StateFactory();
    const newInst = new ExtendingClass();
    newStateFactory._createClass(
      newInst as Record<string, TypeOfTypes>,
      [],
      newInst as Record<string, unknown>
    );

    mapOfClasses.set(Class, newInst);
    return newInst as InstanceType<W>;
  },
  Number: (define: number) => {
    return define;
  },
  Object: <W>(define: W) => {
    return define;
  },
  Record: <W>(define: W, proxyClass?: Record<string, W>) => {
    const toMakeProxy = proxyClass || (new CustomRecord() as Record<string, W>);
    const proxy = reactive(makeReactive(define, toMakeProxy));
    return proxy;
  },
  String: (define: string) => {
    return define;
  },
};

export class StateFactory {
  schemaInfoMap: Record<string, unknown> = {};
  _uid: string;
  static uidMap: Record<string, number> = {};

  constructor() {
    const currNow = Date.now();
    const currNowCount = (StateFactory.uidMap[`${currNow}`] || 0) + 1;
    StateFactory.uidMap[`${currNow}`] = currNowCount;
    this._uid = `${currNow}-${currNowCount}`;
  }

  get uid() {
    return this._uid;
  }

  static getStore<W extends { new (...args: unknown[]): InstanceType<W> }>(
    Class: W
  ) {
    return types.Class(Class);
  }

  _getOptions({
    mutations,
    stateWrapper,
    state,
  }: StoreStateOptions): GetOptionsParams {
    return {
      dbProm: stateWrapper.dbConnect(),
      mutations: mutations,
      stateWrapper,
      state,
      payload: undefined,
    }; // can pass middleware and addons this way
  }

  _setActions(
    actions: Record<string, (...args: unknown[]) => unknown>,
    newInst: Record<string, unknown>,
    paramOptions: { queuePromise: CustomPromise } & StoreStateOptions
  ) {
    const { mutations, stateWrapper, state } = paramOptions;
    for (const prop in actions) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      Object.getPrototypeOf(newInst)[prop] = async (
        params: Record<string, unknown>
      ) => {
        if (!params || !params.payload) {
          const new_queuePromise = new CustomPromise();
          const old_queuePromise = paramOptions.queuePromise;
          paramOptions.queuePromise = new_queuePromise;

          if (old_queuePromise !== undefined) await old_queuePromise;

          const options = this._getOptions({
            mutations,
            stateWrapper,
            state,
          }) as { payload?: unknown } & StoreStateOptions;
          options.payload = params;
          return await new_queuePromise.forceResolve(
            actions[prop].call(newInst, options)
          );
        } else {
          const options = this._getOptions({ mutations, stateWrapper, state });
          options.payload = params.payload;
          return await actions[prop].call(newInst, options);
        }
      };
    }
  }

  _setSchema(
    obj: Record<string, unknown>,
    prop: string,
    schema: Record<string, unknown>
  ) {
    const type = Array.isArray(obj[prop])
      ? 'array'
      : typeof obj[prop] || 'object'; // the initial parent does not have type, default to object
    if (type === 'object') {
      const nestedSchema = {};
      schema[prop] = nestedSchema;

      const currRecord = obj[prop] as Record<string, unknown>;
      for (const propOfObjectType in currRecord) {
        if (currRecord !== undefined) {
          this._setSchema(currRecord, propOfObjectType, nestedSchema);
        }
      }
      return;
    }

    const globalType: string = type.replace(
      type.charAt(0),
      type.charAt(0).toUpperCase()
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    schema[prop] = self[globalType];
  }

  _createClass(
    paramInstance: Record<string, unknown>,
    pathArr: Array<string>,
    currState: Record<string, unknown> | Array<unknown>
  ) {
    const pathString = JSON.stringify(pathArr);
    if (this.schemaInfoMap[pathString]) return this.schemaInfoMap[pathString];
    this.schemaInfoMap[pathString] = paramInstance;

    const isRecord = !!paramInstance[prefix];
    if (!isRecord) {
      delete paramInstance[''];
    }

    const props = [
      ...Object.keys(
        paramInstance
      ) /*, ...Object.getOwnPropertyNames(Class.prototype) */,
    ];
    const schema = {};
    const stores = {};

    for (const prop of props) {
      if (prop === 'constructor' && typeof paramInstance[prop] === 'function')
        continue;

      if (typeof paramInstance[prop] !== 'function') {
        this._setSchema(paramInstance, prop, schema);
        if (isRecord) {
          // if its a record, we skip the keypath
          this._generateStores(
            stores,
            [],
            paramInstance[prop] as Record<string, unknown>
          );
        } else {
          this._generateStores(stores, [], paramInstance);
        }
      }
    }
    if (isRecord) {
      paramInstance[''] = undefined;
      delete paramInstance[''];
    }
    const storeKeys = Object.keys(stores);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const parentState = new StateWrapper({
      schema,
      type: isRecord ? 'Record' : 'Object',
      dbName: `${String(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        Object.getPrototypeOf(paramInstance).constructor.name
		)}_${String(
		  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        Object.getPrototypeOf(Object.getPrototypeOf(paramInstance)).constructor
          .name
      )}`,
    });
    parentState.state = currState || parentState.state;
    parentState.stores = storeKeys.length ? `,${storeKeys.join(',')}` : '';

    const sharedOptions = {} as Record<
      string,
      { queuePromise: CustomPromise } & StoreStateOptions
    >;
    const { mutations } = this._createMutations(
      paramInstance,
      pathArr,
      pathString,
      parentState,
      parentState.state
    );

    const fns = Object.getOwnPropertyNames(
      Object.getPrototypeOf(Object.getPrototypeOf(paramInstance))
    );
    for (const prop of fns) {
      if (prop === 'constructor' && typeof paramInstance[prop] === 'function')
        continue;

      if (typeof paramInstance[prop] !== 'function') {
        continue;
      } else {
        sharedOptions[prop] = sharedOptions[prop] || {
          queuePromise: new CustomPromise(),
          mutations,
          stateWrapper: parentState,
        };
        const fn = paramInstance[prop] as (...args: unknown[]) => unknown;
        this._setActions(
          { [prop]: fn } as Record<string, (...args: unknown[]) => unknown>,
          paramInstance,
          sharedOptions[prop]
        );
        void sharedOptions[prop].queuePromise.forceResolve();
      }
    }
  }

  _generateStores(
    saveToObj: Record<string, unknown>,
    nestedProps: Array<string>,
    currObj: Record<string, unknown> | Array<unknown>
  ) {
    const keys = Array.isArray(currObj)
      ? Object.keys(new Array(currObj.length))
      : Object.keys(currObj);
    const len = keys.length;

    if (keys.length) {
      for (let i = 0; i < len; i++) {
        const prop = Array.isArray(currObj) ? i : keys[i];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const next = currObj[prop] as unknown;

        if (
          next &&
          (typeof next === 'object' || next instanceof CustomRecord)
        ) {
          this._generateStores(
            saveToObj,
            [...nestedProps, String(prop)],
            next as Record<string, unknown>
          );
        } else if (next && Array.isArray(next)) {
          const schemaProp = `*${nestedProps.join('.')}${
            nestedProps.length ? '.' : ''
          }${prop}`;
          saveToObj[schemaProp] = next;
        } else {
          const schemaProp = `${nestedProps.join('.')}${
            nestedProps.length ? '.' : ''
          }${prop}`;
          saveToObj[schemaProp] = next;
        }
      }
    } else if (Array.isArray(currObj)) {
      const schemaProp = `*${nestedProps.join('.')}`;
      saveToObj[schemaProp] = '';
    }

    return saveToObj;
  }

  _createMutations(
    paramInstance: Record<string, unknown>,
    pathArr: Array<string>,
    pathString: string,
    parentState: StateWrapper,
    valueObj: Record<string, unknown> | Array<unknown>
  ) {
    let lastPromiseProxyGet: CustomPromise | undefined;
    let lastPromiseProxySet: CustomPromise | undefined;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mutations = new Proxy(valueObj, {
      get: (_targetState, paramProp) => {
        const prop = String(paramProp);

        return {
          get: async () => {
            // ensure data is set async-ly, but also chronologically
            // so that data is not incorrectly represented.
            // example, two function ask for how many of "x" exists, race condtion both say 0
            // but then both use 0 as a basis and add two items to "x". However, because of
            // the race condition... Two exists, but both conditions now think there is only one
            // and might accidently set the count to 1 somewhere else.
            const new_lastPromiseProxyGetSet = new CustomPromise();
            const old_lastPromiseProxyGetSet = lastPromiseProxyGet;
            lastPromiseProxyGet = new_lastPromiseProxyGetSet;

            if (old_lastPromiseProxyGetSet !== undefined)
              await old_lastPromiseProxyGetSet;

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (valueObj[prop] === undefined) {
              try {
                let newVal = await parentState.get(prop);
                if (newVal === undefined) {
                  newVal = paramInstance[prop];
                  const newPath = [
                    ...(JSON.parse(pathString) as Array<string>),
                    prop,
                  ] as Array<string>;
                  const type = typeof newVal;
                  const newPathStr = JSON.stringify(newPath);

                  if (type === 'object' && newVal) {
                    this._createMutations(
                      newVal as Record<string, unknown>,
                      newPath,
                      newPathStr,
                      parentState,
                      newVal as Record<string, unknown>
                    );
                  }
                  await parentState.set(prop, newVal);
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                valueObj[`${prefix}${prop}`] = newVal;
                /** @todo emit that property has changed, and pass mutations to it */
              } catch (e) {
                console.error(e);
              }
            }

            return await new_lastPromiseProxyGetSet.forceResolve(
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
            	parentState.state
            );
          },
          set: async (newVal: unknown) => {
            // ensure data is set async-ly, but also chronologically
            // so that data is not incorrectly represented.
            // example, two function ask for how many of "x" exists, race condtion both say 0
            // but then both use 0 as a basis and add two items to "x". However, because of
            // the race condition... Two exists, but both conditions now think there is only one
            // and might accidently set the count to 1 somewhere else.
            const new_lastPromiseProxyGetSet = new CustomPromise();
            const old_lastPromiseProxyGetSet = lastPromiseProxySet;
            lastPromiseProxySet = new_lastPromiseProxyGetSet;

            if (old_lastPromiseProxyGetSet !== undefined)
              await old_lastPromiseProxyGetSet;

            try {
              await parentState.set(prop, newVal);

              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              valueObj[`${prefix}${prop}`] = newVal;
              // paramInstance[prop].value = newVal;

              /** @todo emit that property has changed, and pass mutations to it */

              await new_lastPromiseProxyGetSet.forceResolve(true);
              return newVal;
            } catch (e) {
              console.error(e);
              await new_lastPromiseProxyGetSet.forceResolve(false);
              return newVal;
            }
          },
        };
      },
      set: (_targ, prop, newVal) => {
        throw `Please use... await state.${String(prop)}.set(${String(
          newVal
        )})`;
      },
    }) as {
      get: () => Promise<unknown>;
      set: (args: unknown) => Promise<void>;
    };

    return { mutations };
  }
}

class StateWrapper {
  _dbName: string;
  state: Record<string, unknown> | Array<unknown>;
  _storeName: string;
  _schema?: StoreSchema;
  stores: string;
  type?: keyof typeof types;

  constructor(options: {
    schema: Record<string, unknown>;
    type: keyof typeof types;
    dbName: string;
  }) {
    const { schema, type, dbName } = options || {};
    this.type = type;
    this._schema = schema;
    this.stores = '';
    this.state = {};
    this._storeName = 'store';
    this._dbName = dbName;
  }

  set schema(val: StoreSchema) {
    this._schema = this._schema || val;
  }
  get schema() {
    if (!this._schema) this._schema = {};
    return this._schema;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  async dbConnect(
    paramTableName = this._storeName,
    paramSchema = this._schema,
    paramDBName = this._dbName,
    paramDBVersion = 0
  ): Promise<{ db: Dexie; table: Dexie.Table }> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    paramDBVersion = paramDBVersion || 1;

    const newSchema =
      this._schema ||
      (typeof paramSchema === 'function'
        ? await Promise.resolve(paramSchema())
        : paramSchema);
    if (newSchema) {
      this.schema = newSchema;
    } else {
      throw 'Schema was not defined';
    }

    const totalDbName = `${String(paramDBName)}__${String(paramTableName)}`;
    let db = new Dexie(totalDbName);
    const databases = await Dexie.getDatabaseNames();
    let dbVersion;
    if (databases.indexOf(totalDbName) < 0 && paramDBVersion !== db.verno) {
      dbVersion = db.version(paramDBVersion);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dbVersion.stores({ [this._storeName]: this.stores });

      // const table = db.table(this._storeName);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // // @ts-ignore
      // if (typeof table.defineClass === 'function') {
      // 	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // 	// @ts-ignore
      // 	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
      // 	table.defineClass(this._schema);
      // }
    }
    db = await db.open();

    return { db, table: db.table(this._storeName) };
  }

  async set(prop: string, value: unknown) {
    if (this.type === 'Array' || this.type === 'Record') {
      const { table } = await this.dbConnect();
      await table.put(Dexie.deepClone(value), prop);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.state[prop] = value;
      return true;
    }

    const { table } = await this.dbConnect();
    await table.put({ [prop]: value }, 0);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.state[prop] = value;
    return true;
  }

  async get(prop: string): Promise<unknown> {
    const { table } = await this.dbConnect();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (this.type === 'Array') {
      const result: Record<string, unknown> | undefined = (await table
        .where(prop)
        .notEqual('')
        .first()) as Record<string, unknown> | undefined;

      return result ? result[prop] : undefined;
    }

    const result: Record<string, unknown> | undefined = (await table
      .where('__id__')
      .equals(0)
      .first()) as Record<string, unknown> | undefined;

    return result ? result[prop] : undefined;
  }
}
