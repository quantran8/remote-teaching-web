import { RoomModel, CalendarSchedulesModel, ClassModelSchedules, TeacherClassCalendarModel, ClassRoomModel } from "@/models";
import { ResourceModel } from "@/models/resource.model";
import { GetterTree } from "vuex";
import { TeacherState } from "./state";

const getters: GetterTree<TeacherState, any> = {
  classes(state: TeacherState): Array<TeacherClassCalendarModel> {
    return state.classes;
  },
  classesSchedules(state: TeacherState): Array<ClassModelSchedules> {
    return state.classesSchedules;
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
  getClassOnline(state: TeacherState): ClassRoomModel | undefined {
    return state.classOnline;
  },
};

export default getters;
