import { Parent } from "@/models/parent.model";
import { ParentService } from "@/services";
import { ActionContext, ActionTree } from "vuex";
import { ParentState } from "./state";

const actions: ActionTree<ParentState, any> = {
  setInfo({ commit }, payload: Parent) {
    commit("setInfo", payload);
  },
  async loadChildren({ commit, state }: ActionContext<ParentState, any>) {
    return new Promise((resolve, reject) => {
      if (!state.info) {
        reject();
        return;
      }
      ParentService.getChildren(state.info.id)
        .then((res) => {
          commit("setChildren", res.children);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export default actions;
