import { ClassModel, RoomModel } from "@/models";
import { UserModel } from "@/models/user.model";
import { MutationTree } from "vuex";
import { TeacherState } from "./state";

const mutations: MutationTree<TeacherState> = {
  setClasses(state: TeacherState, payload: Array<ClassModel>) {
    state.classes = payload;
    state.classes.forEach((cl) => {
      cl.isActive = state.room?.classId === cl.schoolClassId;
    });
  },
  setClassRoom(state: TeacherState, payload: RoomModel) {
    state.room = payload;
    state.classes.forEach((cl) => {
      cl.isActive = state.room?.classId === cl.schoolClassId;
    });
  },
  setInfo(state: TeacherState, payload: UserModel) {
    state.info = payload;
  },
};

export default mutations;
