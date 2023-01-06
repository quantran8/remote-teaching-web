import { CalendarSchedulesModel, ClassGroupModel, ClassModel, ClassModelSchedules, ClassRoomModel, RoomModel, StudentGroupModel } from "@/models";
import { ResourceModel } from "@/models/resource.model";
import { UserModel } from "@/models/user.model";
import { ScheduleType } from "@/utils/utils";
import moment from "moment";
import { MutationTree } from "vuex";
import { TeacherState } from "./state";

const mutations: MutationTree<TeacherState> = {
  setSchools(state: TeacherState, payload: Array<ResourceModel>) {
    state.schools = payload;
    state.currentSchoolId = payload[0].id;
  },
  setClasses(state: TeacherState, payload: Array<ClassModel>) {
    state.classes = payload;
  },
  setClassesSchedules(state: TeacherState, payload: Array<ClassModelSchedules>) {
    state.classesSchedules = payload;
  },
  setClassesSchedulesAllSchool(state: TeacherState, payload: Array<ClassModelSchedules>) {
    state.classesSchedulesAllSchool = payload;
  },
  clearCalendarSchedule(state: TeacherState, payload: any) {
    state.calendarSchedules = [];
  },
  clearAllClassesSchedulesAllSchool(state: TeacherState, payload: any) {
    state.classesSchedulesAllSchool = [];
  },
  setCalendarSchedule(state: TeacherState, payload: Array<CalendarSchedulesModel>) {
    if (payload) {
      state.calendarSchedules = payload.map((calendarSchedule) => {
        calendarSchedule.schedules.map((schedule) => {
          if (schedule.customizedScheduleId == null) {
            schedule.customizedScheduleId = "0000-" + Math.random().toString(36).substr(2, 9);
          }
          return schedule;
        });
        return calendarSchedule;
      });
    }
  },
  setCalendarAllSchedule(state: TeacherState, payload: Array<CalendarSchedulesModel>) {
    if (payload) {
      const data = payload.map((calendarSchedule) => {
        calendarSchedule.schedules.map((schedule) => {
          if (schedule.customizedScheduleId == null) {
            schedule.customizedScheduleId = "0000-" + Math.random().toString(36).substr(2, 9);
          }
          return schedule;
        });
        return calendarSchedule;
      });
      state.calendarSchedules = [...state.calendarSchedules, ...data];
    }
  },
  setClassRoom(state: TeacherState, payload: RoomModel) {
    state.room = payload;
    state.classesSchedules.forEach((cl) => {
      cl.isActive = state.room?.classInfo.classId === cl.classId;
    });
  },
  setClassOnline(state: TeacherState, payload: ClassRoomModel) {
    state.classOnline = payload;
  },
  setInfo(state: TeacherState, payload: UserModel) {
    state.info = payload;
  },
  setAcceptPolicy(state: TeacherState, payload: boolean) {
    state.acceptPolicy = payload;
  },
  updateCalendarSchedule(state: TeacherState, payload: any) {
    const dayExist = state.calendarSchedules.filter((calendarSchedule) => {
      return calendarSchedule.day == payload.day;
    });
    switch (payload.data.type) {
      case "Create":
        if (dayExist.length > 0) {
          state.calendarSchedules.map((dayCalendar) => {
            if (dayCalendar.day == payload.day) {
              dayCalendar.schedules.push({
                classId: payload.data.schoolClassId,
                className: payload.className,
                groupId: payload.data.groupId,
                groupName: payload.groupName,
                end: moment(payload.data.end).format("HH:mm:ss"),
                start: moment(payload.data.start).format("HH:mm:ss"),
                customizedScheduleId: payload.id,
                customizedScheduleType: ScheduleType.Create,
                timeId: payload.data.timeId,
                isHistory: false,
              });
            }
            return dayCalendar;
          });
        } else {
          state.calendarSchedules.push({
            day: payload.day,
            schedules: [
              {
                classId: payload.data.schoolClassId,
                className: payload.className,
                groupId: payload.data.groupId,
                groupName: payload.groupName,
                end: moment(payload.data.end).format("HH:mm:ss"),
                start: moment(payload.data.start).format("HH:mm:ss"),
                customizedScheduleId: payload.id,
                customizedScheduleType: ScheduleType.Create,
                timeId: payload.data.timeId,
                isHistory: false,
              },
            ],
          });
          state.calendarSchedules.sort((a, b) => moment(a.day).valueOf() - moment(b.day).valueOf());
        }
        break;
      case "Skip": {
        const dayCalendar = state.calendarSchedules.find((item) => item.day === payload.day);
        if (dayCalendar) {
          const schedule = dayCalendar.schedules.find((s) => s.customizedScheduleId === payload.customId);
          if (schedule) {
            schedule.customizedScheduleType = ScheduleType.Cancelled;
            schedule.customizedScheduleId = payload.scheduleId;
          }
        }
        break;
      }
      case "Delete":
        if (!payload.data.customizedScheduleType || payload.data.customizedScheduleType === ScheduleType.Create) {
          state.calendarSchedules.map((dayCalendar) => {
            if (dayCalendar.day == payload.day) {
              dayCalendar.schedules = dayCalendar.schedules.filter((schedule) => {
                return schedule.customizedScheduleId != payload.data.scheduleId;
              });
            }
            return dayCalendar;
          });
        } else {
          if (payload.data.customizedScheduleType === ScheduleType.Cancelled) {
            const dayCalendar = state.calendarSchedules.find((item) => item.day === payload.day);
            if (dayCalendar) {
              const schedule = dayCalendar.schedules.find((s) => s.customizedScheduleId === payload.data.scheduleId);
              if (schedule) {
                schedule.customizedScheduleId = "0000-" + Math.random().toString(36).substr(2, 9);
                schedule.customizedScheduleType = null;
              }
            }
          }
        }

        break;
      case "Update":
        state.calendarSchedules.map((dayCalendar) => {
          if (dayCalendar.day == payload.day) {
            dayCalendar.schedules = dayCalendar.schedules.map((schedule) => {
              if (schedule.customizedScheduleId != payload.data.customizedScheduleId) return schedule;
              schedule.groupName = payload.groupName;
              schedule.groupId = payload.data.groupId;
              schedule.start = moment(payload.data.start).format("HH:mm:ss");
              schedule.end = moment(payload.data.end).format("HH:mm:ss");
              return schedule;
            });
          }
          return dayCalendar;
        });
        break;
    }
  },
  setCurrentSchool(state: TeacherState, payload: string) {
    state.currentSchoolId = payload;
  },
  setCurrentGroupStudents(state: TeacherState, payload: any) {
    state.currentGroupStudents = payload;
  },
  setClassesSchedulesBySchools(state: TeacherState, payload: Array<ClassModelSchedules>) {
    state.classesSchedulesBySchools = [...state.classesSchedulesBySchools, ...payload];
  },
  setClassSetUpStudents(state: TeacherState, payload: Array<StudentGroupModel>) {
    state.classSetUpStudents = payload;
  },
  clearClassesSchedulesBySchools(state: TeacherState) {
    state.classesSchedulesBySchools = [];
  },
  setClassGroup(state: TeacherState, payload: Array<ClassGroupModel>) {
    state.classGroup = payload;
  },
};

export default mutations;
