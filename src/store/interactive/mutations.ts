import { InteractiveModel } from "@/models";
import { MutationTree } from "vuex";
import { InteractiveState, StudentId, Target } from "./state";

export interface InteractiveMutationInterface<S> {
  setDesignatingTarget(s: S, p: { isDesignatingTarget: boolean }): void;
  setTargets(s: S, p: { targets: Array<Target> }): void;
  setInfo(s: S, p: InteractiveModel): void;
  setStudentsSelected(s: S, p: { studentsSelected: Array<StudentId> }): void;
  setCurrentUserId(s: S, userId: string): void;
}

export interface InteractiveMutation<S>
  extends MutationTree<S>,
    InteractiveMutationInterface<S> {}

const mutations: InteractiveMutation<InteractiveState> = {
  setInfo(s: InteractiveState, p: InteractiveModel) {
    if (!p) {
      s.targets = [];
      s.studentsSelected = [];
      s.isDesignatingTarget = false;
      return;
    }
    const { studentInteractives, targets } = p;
    s.targets = targets;
    s.studentsSelected = studentInteractives.map((s: any) => {
      return { id: s.studentId };
    });
  },
  setDesignatingTarget(
    s: InteractiveState,
    p: { isDesignatingTarget: boolean }
  ): void {
    s.isDesignatingTarget = p.isDesignatingTarget;
  },
  setTargets(s: InteractiveState, p: { targets: Array<Target> }) {
    s.targets = p.targets;
  },
  setStudentsSelected(
    s: InteractiveState,
    p: { studentsSelected: Array<StudentId> }
  ) {
    s.studentsSelected = p.studentsSelected;
  },
  setCurrentUserId(s: InteractiveState, userId: string) {
    s.currentUserId = userId;
  },
};

export default mutations;
