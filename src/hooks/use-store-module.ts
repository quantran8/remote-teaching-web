import { useStore, Store } from "vuex";

interface InternalModule<S, A, M, G> {
  state: S;
  actions: A;
  mutations: M;
  getters: G;
}

// /**
//  * This function allows us to access the internal vuex properties and
//  * maps them in a way which removes the module prefix.
//  */
// function getFromStoreByType<T>(
//   moduleName: string,
//   type: object,
//   isNamespaced: boolean
// ) {
//   if (isNamespaced) {
//     return Object.keys(type)
//       .filter((t) => t.startsWith(`${moduleName}/`))
//       .reduce((acc, curr) => {
//         const typeName = curr.split("/").pop();
//         const typeValue = type[curr][0];
//         return { [typeName]: typeValue, ...acc };
//       }, {}) as T;
//   }

//   return Object.keys(type).reduce((acc, curr) => {
//     const typeValue = type[curr][0];

//     return { [curr]: typeValue, ...acc };
//   }, {}) as T;
// }

// /**
//  * We have to wrap the getters in a Proxy because we only want to
//  * "access" the getter if it actually being accessed.
//  *
//  * We could technically use the getFromStoreByType function but
//  * the getter would be invoked multiple types on store instantiation.
//  *
//  * This is just a little cheeky workaround. Proxy <3
//  */
// function wrapGettersInProxy<G>(
//   moduleName: string,
//   getters: G,
//   isNamespaced: boolean
// ) {
//   return new Proxy(getters as Object, {
//     get(_, prop: string) {
//       if (isNamespaced) {
//         return getters[`${moduleName}/${prop}`];
//       }

//       return getters[prop];
//     },
//   }) as G;
// }

// function isModuleNamespaced<S>(moduleName: string, store: Store<S>): boolean {
//   // @ts-ignore internal Vuex object that isn't typed.
//   return Boolean(store._modulesNamespaceMap[`${moduleName}/`]);
// }

// export default function useStoreModule<S = any, A = any, M = any, G = any>(
//   moduleName: string,
//   storeName?: string
// ): InternalModule<S, A, M, G> {
//   // @ts-ignore useStore doesn't yet accept a key as arg
//   const store = storeName ? useStore(storeName) : useStore();
//   const state = store.state[moduleName];
//   const isNamespaced = isModuleNamespaced(moduleName, store);

//   const actions = getFromStoreByType<A>(
//     moduleName,
//     // @ts-ignore internal Vuex object that isn't typed.
//     store._actions,
//     isNamespaced
//   );

//   const mutations = getFromStoreByType<M>(
//     moduleName,
//     // @ts-ignore internal Vuex object that isn't typed.
//     store._mutations,
//     isNamespaced
//   );

//   const getters = wrapGettersInProxy<G>(
//     moduleName,
//     store.getters,
//     isNamespaced
//   );

//   return {
//     actions,
//     mutations,
//     state,
//     getters,
//   };
// }
