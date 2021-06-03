import { ClassModel, RoomModel, CalendarSchedulesModel } from "@/models";
import { ResourceModel } from "@/models/resource.model";
import { UserModel } from "@/models/user.model";
import moment from "moment";
import { MutationTree } from "vuex";
import { TeacherState } from "./state";

const mutations: MutationTree<TeacherState> = {
  setSchools(state: TeacherState, payload: Array<ResourceModel>) {
    state.schools = payload;
  },
  setClasses(state: TeacherState, payload: Array<ClassModel>) {
    if (payload && payload.length != 0) {
      state.classes = payload;
    }
  },
  clearCalendarSchedule(state: TeacherState, payload: any) {
    state.calendarSchedules = [];
  },
  setCalendarSchedule(state: TeacherState, payload: Array<CalendarSchedulesModel>) {
    if (payload && payload.length != 0) {
      state.calendarSchedules = payload;
    }
  },
  setClassRoom(state: TeacherState, payload: RoomModel) {
    state.room = payload;
    state.classes.forEach(cl => {
      cl.isActive = state.room?.classId === cl.schoolClassId;
    });
  },
  setInfo(state: TeacherState, payload: UserModel) {
    state.info = payload;
  },
  setAcceptPolicy(state: TeacherState, payload: boolean) {
    state.acceptPolicy = payload;
  },
  updateCalendarSchedule(state: TeacherState, payload: any) {
    switch (payload.data.type) {
      case "Delete":
        state.calendarSchedules.map(dayCalendar => {
          if (dayCalendar.day == payload.day) {
            dayCalendar.schedules.filter(schedule => {
              return schedule.customizedScheduleId != payload.data.scheduleId;
            });
          }
          return dayCalendar;
        });
        break;
      case "Update":
        state.calendarSchedules.map(dayCalendar => {
          if (dayCalendar.day == payload.day) {
            dayCalendar.schedules.map(schedule => {
              if (schedule.customizedScheduleId == payload.data.customizedScheduleId) {
                schedule.groupId = payload.data.groupId;
                schedule.start = moment(payload.data.start).format("HH:mm:ss");
                schedule.end = moment(payload.data.end).format("HH:mm:ss");
              }
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
