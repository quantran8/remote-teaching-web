import {
  RoomModel,
  CalendarSchedulesModel,
  ClassModelSchedules,
  TeacherClassCalendarModel
} from "@/models";
import { ResourceModel } from "@/models/resource.model";
import { UserModel } from "@/models/user.model";


export interface TeacherState {
  info?: UserModel;
  schools: Array<ResourceModel>;
  classes: Array<TeacherClassCalendarModel>;
  classesSchedules: Array<ClassModelSchedules>;
  room?: RoomModel;
  acceptPolicy: boolean;
  calendarSchedules: Array<CalendarSchedulesModel>;
}

const state: TeacherState = {
  info: undefined,
  schools: [],
  classes: [],
  room: undefined,
  acceptPolicy: true,
  calendarSchedules: [],
  classesSchedules: [],
};

export default state;
