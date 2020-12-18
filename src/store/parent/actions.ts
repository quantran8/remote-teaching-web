import { Parent } from "@/models";
import { GetChildrenModel, ParentService } from "@/services";
import { ActionContext, ActionTree } from "vuex";
import { ParentState } from "./state";

const actions: ActionTree<ParentState, any> = {
  setInfo({ commit }, payload: Parent) {
    commit("setInfo", payload);
  },
  setSelectedChild({ commit }, payload: { childId: string }) {
    commit("setSelectedChild", payload);
  },
  async loadChildren({ commit, state }: ActionContext<ParentState, any>) {
    return new Promise((resolve, reject) => {
      if (!state.info) {
        reject();
        return;
      }
      ParentService.getChildren<GetChildrenModel>(state.info.id)
        .then((res: any) => {
          commit("setChildren", res.children);
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export default actions;
