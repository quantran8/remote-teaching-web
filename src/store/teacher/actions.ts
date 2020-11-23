import { ContentService } from "@/commonui/services/content.service";
import { ClassModel } from "@/models/class.model";
import { Parent } from "@/models/parent.model";
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
      new ContentService()
        .teacherGetClasses(state.info.id)
        .then((res: Array<ClassModel>) => {
          commit("setClasses", res);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export default actions;
