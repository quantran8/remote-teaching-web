import { Parent } from "@/models";
import {
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
    commit("setClasses", response.data);
  },
  async loadClassRoom({ commit, state }: ActionContext<TeacherState, any>) {
    if (!state.info) return;
    const response: TeacherGetRoomResponse = await RemoteTeachingService.getActiveClassRoom();
    commit("setClassRoom", response.data);
  },
};

export default actions;
