import { Parent } from "@/models/parent.model";
import { GetClassesModel, TeacherService } from "@/services";
import { ActionContext, ActionTree } from "vuex";
import { TeacherState } from "./state";

const actions: ActionTree<TeacherState, any> = {
  setInfo({ commit }, payload: Parent) {
    commit("setInfo", payload);
  },
  async loadClasses({ commit, state }: ActionContext<TeacherState, any>) {
    return new Promise((resolve, reject) => {
      if (!state.info) {
        reject();
        return;
      }
      TeacherService.getClasses(state.info.id)
        .then((res: GetClassesModel) => {
          commit("setClasses", res.data);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export default actions;
