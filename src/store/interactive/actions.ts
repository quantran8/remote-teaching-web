import { InteractiveModel } from "@/models";
import { ActionContext, ActionTree } from "vuex";
import { InteractiveState, StudentId, Target } from "./state";

export interface InteractiveActionInterface<S, R> {
  setDesignatingTarget(
    s: ActionContext<S, R>,
    p: { isDesignatingTarget: boolean }
  ): void;
  setTargets(s: ActionContext<S, R>, p: { targets: Array<Target> }): void;
  setLocalTargets(s: ActionContext<S, R>, p: { targets: Array<string> }): void;
  setStudentsSelected(
    s: ActionContext<S, R>,
    p: { studentsSelected: Array<StudentId> }
  ): void;
  setInfo(s: ActionContext<S, R>, p: InteractiveModel): void;
  setCurrentUserId(s: ActionContext<S, R>, p: string): void;
  setRevealedTarget(s: ActionContext<S, R>, targetId: string): void;
  setRevealedLocalTarget(s: ActionContext<S, R>, p: Array<string>): void;
}

export interface InteractiveAction<S, R>
  extends ActionTree<S, R>,
    InteractiveActionInterface<S, R> {}

const actions: ActionTree<InteractiveState, any> = {
  setDesignatingTarget({ commit }, p: { isDesignatingTarget: boolean }) {
    commit("setDesignatingTarget", p);
  },
  setTargets({ commit }, p: { targets: Array<Target> }) {
    commit("setTargets", p);
  },
  setLocalTargets({ commit }, p: { targets: Array<string> }) {
    commit("setLocalTargets", p);
  },
  setStudentsSelected({ commit }, p: { studentsSelected: Array<StudentId> }) {
    commit("setStudentsSelected", p);
  },
  setInfo({ commit }, p: InteractiveModel) {
    commit("setInfo", p);
  },
  setCurrentUserId({ commit }, p: string) {
    commit("setCurrentUserId", p);
  },
  setRevealedTarget({ commit }, targetId: string) {
    commit("setRevealedTarget", targetId);
  },
  setRevealedLocalTarget({ commit }, p: Array<string>) {
    commit("setRevealedLocalTarget", p);
  },
  setUpdateStudentsAnswerForTeacher({commit}, p: {studentId: string, answerList: Array<string>}) {
    commit("setUpdateStudentsAnswerForTeacher", p);
  },
};
export default actions;
