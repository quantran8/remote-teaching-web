import { Parent } from "@/models";
import { AccessibleSchoolQueryParam, RemoteTeachingService, ScheduleParam, TeacherGetRoomResponse, TeacherService } from "@/services";
import { ActionContext, ActionTree } from "vuex";
import { TeacherState } from "./state";

const actions: ActionTree<TeacherState, any> = {
  async setInfo({ dispatch, commit }, payload: Parent) {
    await dispatch("setAcceptPolicy");
    commit("setInfo", payload);
  },
  async loadClasses({ commit, state }: ActionContext<TeacherState, any>, payload: { schoolId: string; browserFingerPrinting: string }) {
    if (!state.info) return;
    const response = await TeacherService.getClasses(state.info.id, payload.schoolId);
    commit("setClasses", response.data);
    const responseActive: TeacherGetRoomResponse = await RemoteTeachingService.getActiveClassRoom(payload.browserFingerPrinting);
    commit("setClassRoom", responseActive.data);
  },
  async loadSchedules(
    { commit, state }: ActionContext<TeacherState, any>,
    payload: { classId: string; groupId: string; startDate: string; endDate: string },
  ) {
    if (!state.info) return;
    const response = await TeacherService.getScheduleCalendar(payload.classId, payload.groupId, payload.startDate, payload.endDate);
    commit("setCalendarSchedule", response);
  },
  async skipSchedule({ commit, state }: ActionContext<TeacherState, any>, payload: ScheduleParam) {
    await TeacherService.skipSchedule(payload);
  },
  async createSchedule({ commit, state }: ActionContext<TeacherState, any>, payload: ScheduleParam) {
    await TeacherService.createSchedule(payload);
  },
  async updateSchedule({ commit, state }: ActionContext<TeacherState, any>, payload: ScheduleParam) {
    await TeacherService.updateSchedule(payload);
  },
  async deleteSchedule({ commit, state }: ActionContext<TeacherState, any>, payload: { scheduleId: string }) {
    await TeacherService.deleteSchedule(payload.scheduleId);
  },
  async loadAccessibleSchools({ commit, state }: ActionContext<TeacherState, any>, payload: AccessibleSchoolQueryParam) {
    try {
      const response = await TeacherService.getAccessibleSchools(payload);
      commit("setSchools", response);
    } catch (error) {
      console.log("loadAccessibleSchools => error", error);
    }
  },
  async setAcceptPolicy({ commit }) {
    const policyResponse: TeacherGetRoomResponse = await RemoteTeachingService.acceptPolicy("teacher");
    commit("setAcceptPolicy", policyResponse.data);
  },
};

export default actions;
