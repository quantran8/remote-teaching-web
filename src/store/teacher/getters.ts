import { ClassModel, RoomModel } from "@/models";
import { GetterTree } from "vuex";
import { TeacherState } from "./state";

const getters: GetterTree<TeacherState, any> = {
  classes(state: TeacherState): Array<ClassModel> {
    return state.classes;
  },
  classRoom(state: TeacherState): RoomModel {
    return state.room as RoomModel;
  },
};

export default getters;
