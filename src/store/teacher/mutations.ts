import { ClassModel, RoomModel, CalendarSchedulesModel, SchedulesModel, ClassModelSchedules } from "@/models";
import { ResourceModel } from "@/models/resource.model";
import { UserModel } from "@/models/user.model";
import moment from "moment";
import { MutationTree } from "vuex";
import { TeacherState } from "./state";

const mutations: MutationTree<TeacherState> = {
  setSchools(state: TeacherState, payload: Array<ResourceModel>) {
    state.schools = payload;
  },
  setClassesSchedules(state: TeacherState, payload: Array<ClassModelSchedules>) {
    if (payload && payload.length != 0) {
      state.classesSchedules = payload;
    }
  },
  clearCalendarSchedule(state: TeacherState, payload: any) {
    state.calendarSchedules = [];
  },
  setCalendarSchedule(state: TeacherState, payload: Array<CalendarSchedulesModel>) {
    if (payload) {
      state.calendarSchedules = payload.map(calendarSchedule => {
        calendarSchedule.schedules.map(schedule => {
          if (schedule.customizedScheduleId == null) {
            schedule.customizedScheduleId =
              "0000-" +
              Math.random()
                .toString(36)
                .substr(2, 9);
          }
          return schedule;
        });
        return calendarSchedule;
      });
    }
  },
  setClassRoom(state: TeacherState, payload: RoomModel) {
    state.room = payload;
    state.classes.forEach(cl => {
      cl.isActive = state.room?.classId === cl.classId;
    });
  },
  setInfo(state: TeacherState, payload: UserModel) {
    state.info = payload;
  },
  setAcceptPolicy(state: TeacherState, payload: boolean) {
    state.acceptPolicy = payload;
  },
  updateCalendarSchedule(state: TeacherState, payload: any) {
    const dayExist = state.calendarSchedules.filter(calendarSchedule => {
      return calendarSchedule.day == payload.day;
    });
    switch (payload.data.type) {
      case "Create":
        if (dayExist.length > 0) {
          state.calendarSchedules.map(dayCalendar => {
            if (dayCalendar.day == payload.day) {
              dayCalendar.schedules.push({
                classId: payload.data.schoolClassId,
                className: payload.className,
                groupId: payload.data.groupId,
                groupName: payload.groupName,
                end: moment(payload.data.end).format("HH:mm:ss"),
                start: moment(payload.data.start).format("HH:mm:ss"),
                customizedScheduleId: payload.id,
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
                timeId: payload.data.timeId,
                isHistory: false,
              },
            ],
          });
          state.calendarSchedules.sort((a, b) => moment(a.day).valueOf() - moment(b.day).valueOf());
        }
        break;
      case "Skip":
        state.calendarSchedules.map(dayCalendar => {
          if (dayCalendar.day == payload.day) {
            dayCalendar.schedules = dayCalendar.schedules.filter(schedule => {
              return schedule.customizedScheduleId != payload.customId;
            });
          }
          return dayCalendar;
        });
        break;
      case "Delete":
        state.calendarSchedules.map(dayCalendar => {
          if (dayCalendar.day == payload.day) {
            dayCalendar.schedules = dayCalendar.schedules.filter(schedule => {
              return schedule.customizedScheduleId != payload.data.scheduleId;
            });
          }
          return dayCalendar;
        });
        break;
      case "Update":
        state.calendarSchedules.map(dayCalendar => {
          if (dayCalendar.day == payload.day) {
            dayCalendar.schedules = dayCalendar.schedules.map(schedule => {
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
};

export default mutations;
