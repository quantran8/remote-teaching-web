import { ClassModel, RoomModel } from "@/models";
import { ResourceModel } from "@/models/resource.model";
import { UserModel } from "@/models/user.model";
import { MutationTree } from "vuex";
import { TeacherState } from "./state";

const mutations: MutationTree<TeacherState> = {
  setSchools(state: TeacherState, payload: Array<ResourceModel>) {
    state.schools = payload;
  },
  setClasses(state: TeacherState, payload: Array<ClassModel>) {
    if (payload && payload.length != 0) {
      state.classes = payload;
    }
  },
  setClassRoom(state: TeacherState, payload: RoomModel) {
    state.room = payload;
    state.classes.forEach(cl => {
      cl.isActive = state.room?.classId === cl.schoolClassId;
    });
  },
  setInfo(state: TeacherState, payload: UserModel) {
    state.info = payload;
  },
  setAcceptPolicy(state: TeacherState, payload: boolean) {
    state.acceptPolicy = payload;
  },
};

export default mutations;
