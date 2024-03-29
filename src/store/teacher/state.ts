import { CalendarSchedulesModel, ClassGroupModel, RoomModel, StudentGroupModel, TeacherClassCalendarModel, TeacherClassModel } from "@/models";
import { ResourceModel } from "@/models/resource.model";
import { UserModel } from "@/models/user.model";
import { ClassRoomModel } from "./../../models/room.model";

export interface StudentsGroup {
  groupId: string;
  groupName: string;
  studentId: string;
  studentName: string;
  nativeName: string;
}
export interface CalendarFilter {
  classId: string;
  groupId: string;
  date: string;
  isShowWeekends: boolean;
}
export interface TeacherState {
  info?: UserModel;
  schools: Array<ResourceModel>;
  classes: Array<TeacherClassCalendarModel>;
  classesSchedules: Array<TeacherClassModel>;
  classesSchedulesAllSchool: Array<TeacherClassModel>;
  room?: RoomModel;
  acceptPolicy: boolean;
  calendarSchedules: Array<CalendarSchedulesModel>;
  classOnline: ClassRoomModel | undefined;
  currentSchoolId: string;
  currentGroupStudents: Array<StudentsGroup>;
  classesSchedulesBySchools: Array<TeacherClassModel>;
  classSetUpStudents: Array<StudentGroupModel>;
  classGroup: Array<ClassGroupModel>;
  calendarFilter: CalendarFilter;
}

const state: TeacherState = {
  info: undefined,
  schools: [],
  classes: [],
  room: undefined,
  acceptPolicy: true,
  calendarSchedules: [],
  classesSchedules: [],
  classesSchedulesAllSchool: [],
  classOnline: undefined,
  currentSchoolId: "",
  currentGroupStudents: [],
  classesSchedulesBySchools: [],
  classSetUpStudents: [],
  classGroup: [],
  calendarFilter: {
    classId: "",
    groupId: "",
    date: "",
    isShowWeekends: false,
  },
};

export default state;
