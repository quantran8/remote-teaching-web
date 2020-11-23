import { Parent } from "@/models/parent.model";
import { ActionTree } from "vuex";
import { RoomState } from "./state";

const actions: ActionTree<RoomState, any> = {
  setInfo({ commit }, payload: Parent) {
    commit("setInfo", payload);
  },
};

export default actions;
