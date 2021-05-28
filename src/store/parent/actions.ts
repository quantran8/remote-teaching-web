import { Parent } from "@/models";
import { GetChildrenModel, ParentService, RemoteTeachingService, StudentGetRoomResponse } from "@/services";
import { ActionContext, ActionTree } from "vuex";
import { ParentState } from "./state";

const actions: ActionTree<ParentState, any> = {
  async setInfo({ dispatch,commit }, payload: Parent) {
    await dispatch("setAcceptPolicy");
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
  async setAcceptPolicy({ commit }) {
    const policyResponse: StudentGetRoomResponse = await RemoteTeachingService.acceptPolicy("parent");
    commit("setAcceptPolicy", policyResponse.data);
  },
};

export default actions;
