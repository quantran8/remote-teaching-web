import { ClassRoomModel } from "./../../models/room.model";
import { RoomModel, CalendarSchedulesModel, TeacherClassCalendarModel, TeacherClassModel } from "@/models";
import { ResourceModel } from "@/models/resource.model";
import { UserModel } from "@/models/user.model";

export interface StudentsGroup {
  groupId: string;
  groupName: string;
  studentId: string;
  studentName: string;
  nativeName: string;
}
export interface TeacherState {
  info?: UserModel;
  schools: Array<ResourceModel>;
  classes: Array<TeacherClassCalendarModel>;
  classesSchedules: Array<TeacherClassModel>;
  room?: RoomModel;
  acceptPolicy: boolean;
  calendarSchedules: Array<CalendarSchedulesModel>;
  classOnline: ClassRoomModel | undefined;
  currentSchoolId: string;
  currentGroupStudents: Array<StudentsGroup>;
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
  currentSchoolId: "",
  currentGroupStudents: [],
};

export default state;
