import { AdminService } from "@/commonui";
import { Parent } from "@/models/parent.model";
import { GetChildrenModel } from "@/services";
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
      new AdminService()
        .getChildren<GetChildrenModel>(state.info.id)
        .then((res: any) => {
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
