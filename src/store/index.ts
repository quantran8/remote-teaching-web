import { createStore } from "vuex";
import AppModule from "./app";
import ClassModule from "./class";
import AuthModule from "./auth";
import SpinModule from "./spin";
import ParentModule from "./parent";
import TeacherModule from "./teacher";
import TeacherRoomModule from "./room/teacher";
import StudentRoomModule from "./room/student";

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
    teacherRoom: TeacherRoomModule,
    studentRoom: StudentRoomModule,
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
  TeacherRoomModule,
  StudentRoomModule,
};
