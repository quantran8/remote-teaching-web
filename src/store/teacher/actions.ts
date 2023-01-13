import { Parent } from "@/models";
import { AccessibleSchoolQueryParam, RemoteTeachingService, ScheduleParam, TeacherGetRoomResponse, TeacherService } from "@/services";
import { store } from "@/store";
import { Logger } from "@/utils/logger";
import { All } from "@/views/teacher-calendar/teacher-calendar";
import { ActionContext, ActionTree } from "vuex";
import { CalendarFilter, StudentsGroup, TeacherState } from "./state";

const actions: ActionTree<TeacherState, any> = {
  async setInfo({ dispatch, commit }, payload: Parent) {
    await dispatch("setAcceptPolicy");
    commit("setInfo", payload);
  },
  async loadClasses({ commit, dispatch, state }: ActionContext<TeacherState, any>, payload: { schoolId: string; browserFingerPrinting: string }) {
    if (!state.info) return;
    const response = await TeacherService.getClasses(state.info.id, payload.schoolId);
    commit("setClasses", response.data);
    try {
      const responseActive: TeacherGetRoomResponse = await RemoteTeachingService.getActiveClassRoom(payload.browserFingerPrinting);
      commit("setClassRoom", responseActive.data);
      await store.dispatch("setVideoCallPlatform", responseActive.data.videoPlatformProvider);
    } catch (err) {
      // process with err
    }
  },

  async loadAllClassesSchedulesAllSchool({ commit, dispatch }: ActionContext<TeacherState, any>, payload: { schoolId: string }) {
    const response = await TeacherService.getAllClassesOfAllSchools();
    commit("setClassesSchedulesAllSchool", response);
  },
  async loadAllClassesSchedules(
    { commit, dispatch }: ActionContext<TeacherState, any>,
    payload: { schoolId: string; browserFingerPrinting: string },
  ) {
    const response = await TeacherService.getAllClassesSchedule(payload.schoolId);
    commit("setClassesSchedules", response);
    try {
      if (payload.browserFingerPrinting != null) {
        const responseActive: TeacherGetRoomResponse = await RemoteTeachingService.getActiveClassRoom(payload.browserFingerPrinting);
        if (responseActive.data) {
          commit("setClassRoom", responseActive.data);
          await store.dispatch("setVideoCallPlatform", responseActive.data.videoPlatformProvider);
          commit("setClassOnline", responseActive.data.classInfo);
          dispatch("teacherRoom/setRoomInfo", responseActive.data, { root: true });
        } else {
          commit("setClassOnline", undefined);
        }
      }
    } catch (err) {
      // process with err
    }
  },
  async clearSchedules({ commit, state }: ActionContext<TeacherState, any>, payload: {}) {
    commit("clearCalendarSchedule");
  },
  async clearAllClassesSchedulesAllSchool({ commit, state }: ActionContext<TeacherState, any>, payload: {}) {
    commit("clearAllClassesSchedulesAllSchool");
  },
  async loadSchedules(
    { commit, state }: ActionContext<TeacherState, any>,
    payload: { schoolId: string; classId: string; groupId: string; startDate: string; endDate: string },
  ) {
    if (!state.info) return;
    const response = await TeacherService.getScheduleCalendar(
      payload.schoolId === All ? "" : payload.schoolId,
      payload.classId,
      payload.groupId,
      payload.startDate,
      payload.endDate,
    );
    commit("setCalendarSchedule", response);
  },
  async loadAllSchedules({ commit }: ActionContext<TeacherState, any>, payload: { startDate: string; endDate?: string }) {
    const response = await TeacherService.getAllScheduleCalendar(payload.startDate, payload.endDate ?? "");
    commit("setCalendarSchedule", response);
  },
  async skipSchedule({ commit, state }: ActionContext<TeacherState, any>, payload: { day: string; customId: string; data: ScheduleParam }) {
    const response = await TeacherService.skipSchedule(payload.data);
    if (response) commit("updateCalendarSchedule", { ...payload, scheduleId: response.scheduleId });
  },
  async createSchedule(
    { commit, state }: ActionContext<TeacherState, any>,
    payload: { day: string; className: string; groupName: string; data: ScheduleParam; id?: string },
  ) {
    const response = await TeacherService.createSchedule(payload.data);
    if (response) {
      payload.id = response;
      commit("updateCalendarSchedule", payload);
    }
  },
  async updateSchedule({ commit, state }: ActionContext<TeacherState, any>, payload: { day: string; groupName: string; data: ScheduleParam }) {
    const response = await TeacherService.updateSchedule(payload.data);
    if (response) commit("updateCalendarSchedule", payload);
  },
  async deleteSchedule({ commit, state }: ActionContext<TeacherState, any>, payload: { day: string; data: { scheduleId: string; type: string } }) {
    const response = await TeacherService.deleteSchedule(payload.data.scheduleId);
    if (response) commit("updateCalendarSchedule", payload);
  },
  async loadAccessibleSchools({ commit, state }: ActionContext<TeacherState, any>, payload: AccessibleSchoolQueryParam) {
    try {
      const response = await TeacherService.getAccessibleSchools(payload);
      commit("setSchools", response);
    } catch (error) {
      Logger.log("loadAccessibleSchools => error", error);
    }
  },
  async setAcceptPolicy({ commit }) {
    const policyResponse: TeacherGetRoomResponse = await RemoteTeachingService.acceptPolicy("teacher");
    commit("setAcceptPolicy", policyResponse.data);
  },
  setCurrentSchool({ commit }, p: string) {
    commit("setCurrentSchool", p);
  },
  async getClassInfo({ commit, state }, p: { classId: string; groupId: string; teacherId: string }) {
    try {
      const result = await RemoteTeachingService.getClassSessionInfo(p.classId, p.groupId, p.teacherId);
      if (result.students.length) {
        commit("setCurrentGroupStudents", result.students);
      }
    } catch (error) {
      commit("setCurrentGroupStudents", []);
      console.log(error);
    }
  },
  setCurrentGroupStudents({ commit }, p: Array<StudentsGroup>) {
    commit("setCurrentGroupStudents", p);
  },
  async setClassesSchedulesBySchools({ commit, state }) {
    for (const school of state.schools) {
      const response = await TeacherService.getAllClassesSchedule(school.id);
      response.forEach((item) => {
        item.schoolId = school.id;
      });
      commit("setClassesSchedulesBySchools", response);
    }
  },
  async getGroupStudents({ commit, state }, p: { classId: string; groupId: string }) {
    const response = await TeacherService.getGroupStudents(p.classId, p.groupId);
    commit("setClassSetUpStudents", response);
  },
  clearClassesSchedulesBySchools({ commit }) {
    commit("clearClassesSchedulesBySchools");
  },
  async setClassGroup({ commit }) {
    const response = await TeacherService.getClassGroup();
    if (response.length) {
      response.forEach((item) => {
        if (item.groups.length) {
          item.groups.sort((a, b) => (a.groupName > b.groupName ? 1 : -1));
        }
      });
      commit("setClassGroup", response);
    }
  },
  setCalendarFilter({ commit }, p: CalendarFilter) {
    commit("setCalendarFilter", p);
  },
};

export default actions;
