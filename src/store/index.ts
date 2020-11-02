import { createStore } from "vuex";
import AppModule from "./app";
import ClassModule from "./class";
export default createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    app: AppModule,
    class: ClassModule,
  },
});
