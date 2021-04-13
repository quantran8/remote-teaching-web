import { ClassModel, RoomModel } from "@/models";
import { ResourceModel } from "@/models/resource.model";
import { GetterTree } from "vuex";
import { TeacherState } from "./state";

const getters: GetterTree<TeacherState, any> = {
  classes(state: TeacherState): Array<ClassModel> {
    console.log("classes",state.classes);
    return state.classes;
  },
  schools(state: TeacherState): Array<ResourceModel> {
    return state.schools;
  },
  classRoom(state: TeacherState): RoomModel {
    return state.room as RoomModel;
  },
};

export default getters;
