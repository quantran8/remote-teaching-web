import { InteractiveStatus } from "@/views/teacher-class/components/student-gallery/student-card/student-card";
import { GetterTree } from "vuex";
import { InteractiveState, StudentId, Target } from "./state";

const getters: GetterTree<InteractiveState, any> = {
  isDesignatingTarget(state: InteractiveState): boolean {
    return state.isDesignatingTarget;
  },
  targets(state: InteractiveState): Array<Target> {
    return state.targets;
  },
  localTargets(state: InteractiveState): Array<string> {
    return state.localTargets;
  },
  studentsSelected(state: InteractiveState): Array<StudentId> {
    return state.studentsSelected;
  },
  isAssigned(state: InteractiveState): boolean {
    return (
      state.targets.length > 0 &&
      state.studentsSelected.find((s) => s.id === state.currentUserId) !==
        undefined
    );
  },
  interactiveStatus(state: InteractiveState) {
    return (studentId: string) => {
      let status = InteractiveStatus.DEFAULT;
      let correct = 0;
      let multiAssign = false;
      const selectedStudent = state.studentsSelected.find(
        (st) => st.id === studentId
      );
      if (selectedStudent && state.targets.length > 0) {
        correct = selectedStudent.answerList.length;
        status =
          correct === state.targets.length
            ? InteractiveStatus.COMPLETED
            : InteractiveStatus.ASSIGNED;
        multiAssign = state.studentsSelected.length > 1;
      }
      return {
        correct,
        status,
        multiAssign,
      };
    };
  },
  currentUserId(state: InteractiveState): string {
    return state.currentUserId;
  },
};

export default getters;
