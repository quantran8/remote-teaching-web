import { ContentService } from "@/services";
import { ActionTree } from "vuex";
import { AgoraState } from "./state";

const actions: ActionTree<AgoraState, any> = {
  addUser(store, payload: string) {
    store.commit("addUser", payload);
  },
  removeUser(store, payload: string) {
    store.commit("removeUser", payload);
  },
};

export default actions;
