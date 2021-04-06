import { ClassModel, Parent } from "@/models";
import {
  AccessibleClassQueryParam,
  AccessibleSchoolQueryParam,
  RemoteTeachingService,
  TeacherGetRoomResponse,
  TeacherService,
} from "@/services";
import { ActionContext, ActionTree } from "vuex";
import { TeacherState } from "./state";

const actions: ActionTree<TeacherState, any> = {
  setInfo({ commit }, payload: Parent) {
    commit("setInfo", payload);
  },
  async loadClasses({ commit, state }: ActionContext<TeacherState, any>) {
    if (!state.info) return;
    const response = await TeacherService.getClasses(state.info.id);
    const responseActive: TeacherGetRoomResponse = await RemoteTeachingService.getActiveClassRoom();
    commit("setClasses", response.data);
    commit("setClassRoom", responseActive.data);
  },
  async loadAccessibleSchools({ commit, state }: ActionContext<TeacherState, any>, payload: AccessibleSchoolQueryParam) {
    if (!state.info) return;
    const response = await TeacherService.getAccessibleSchools(payload);
    commit("setSchools", response);
  },
  async loadAccessibleClasses({ commit, state }: ActionContext<TeacherState, any>, payload: AccessibleClassQueryParam) {
    if (!state.info) return;
    const response = await TeacherService.getAccessibleClasses(payload) as unknown[] as ClassModel[];
    const responseActive: TeacherGetRoomResponse = await RemoteTeachingService.getActiveClassRoom();
    commit("setClasses", response);
    commit("setClassRoom", responseActive.data);
  },
};

export default actions;
