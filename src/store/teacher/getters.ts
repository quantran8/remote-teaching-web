import { ClassModel, RoomModel, CalendarSchedulesModel } from "@/models";
import { ResourceModel } from "@/models/resource.model";
import { GetterTree } from "vuex";
import { TeacherState } from "./state";

const getters: GetterTree<TeacherState, any> = {
  classes(state: TeacherState): Array<ClassModel> {
    return state.classes;
  },
  schools(state: TeacherState): Array<ResourceModel> {
    return state.schools;
  },
  classRoom(state: TeacherState): RoomModel {
    return state.room as RoomModel;
  },
  acceptPolicy(state: TeacherState): boolean {
    return state.acceptPolicy;
  },
  calendarSchedules(state: TeacherState): Array<CalendarSchedulesModel> {
    return state.calendarSchedules;
  },
};

export default getters;
