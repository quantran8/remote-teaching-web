import { Parent } from "@/models";
import { AccessibleSchoolQueryParam, RemoteTeachingService, TeacherGetRoomResponse, TeacherService } from "@/services";
import { ActionContext, ActionTree } from "vuex";
import { TeacherState } from "./state";

const actions: ActionTree<TeacherState, any> = {
  async setInfo({ dispatch, commit }, payload: Parent) {
    await dispatch("setAcceptPolicy");
    commit("setInfo", payload);
  },
  async loadClasses({ commit, state }: ActionContext<TeacherState, any>, payload: { schoolId: string }) {
    if (!state.info) return;
    const response = await TeacherService.getClasses(state.info.id, payload.schoolId);
    const responseActive: TeacherGetRoomResponse = await RemoteTeachingService.getActiveClassRoom();
    commit("setClasses", response.data);
    commit("setClassRoom", responseActive.data);
  },
  async loadAccessibleSchools({ commit, state }: ActionContext<TeacherState, any>, payload: AccessibleSchoolQueryParam) {
	  console.log('1', state.info);
    if (!state.info) return;
	console.log('2');
    const response = await TeacherService.getAccessibleSchools(payload);
    commit("setSchools", response);
  },
  async setAcceptPolicy({ commit }) {
    const policyResponse: TeacherGetRoomResponse = await RemoteTeachingService.acceptPolicy();
    commit("setAcceptPolicy", policyResponse.data);
  },
};

export default actions;
