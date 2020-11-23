import { createStore } from "vuex";
import AppModule from "./app";
import ClassModule from "./class";
import AuthModule from "./auth";
import SpinModule from "./spin";
import ParentModule from "./parent";
import TeacherModule from "./teacher";
import RoomModule from "./room";

const store = createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    app: AppModule,
    class: ClassModule,
    auth: AuthModule,
    spin: SpinModule,
    parent: ParentModule,
    teacher: TeacherModule,
    room: RoomModule,
  },
});

export {
  store,
  AppModule,
  ClassModule,
  AuthModule,
  SpinModule,
  ParentModule,
  TeacherModule,
  RoomModule,
};
