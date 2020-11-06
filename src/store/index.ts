import { createStore } from "vuex";
import AppModule from "./app";
import ClassModule from "./class";
import AuthModule from "./auth";
import SpinModule from "./spin";

const store = createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    app: AppModule,
    class: ClassModule,
    auth: AuthModule,
    spin: SpinModule,
  },
});

export { store, AppModule, ClassModule, AuthModule, SpinModule };
