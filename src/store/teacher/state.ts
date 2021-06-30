import { ClassRoomModel } from "./../../models/room.model";
import { RoomModel, CalendarSchedulesModel, TeacherClassCalendarModel, TeacherClassModel } from "@/models";
import { ResourceModel } from "@/models/resource.model";
import { UserModel } from "@/models/user.model";

export interface TeacherState {
  info?: UserModel;
  schools: Array<ResourceModel>;
  classes: Array<TeacherClassCalendarModel>;
  classesSchedules: Array<TeacherClassModel>;
  room?: RoomModel;
  acceptPolicy: boolean;
  calendarSchedules: Array<CalendarSchedulesModel>;
  classOnline: ClassRoomModel | undefined;
}

const state: TeacherState = {
  info: undefined,
  schools: [],
  classes: [],
  room: undefined,
  acceptPolicy: true,
  calendarSchedules: [],
  classesSchedules: [],
  classOnline: undefined,
};

export default state;
