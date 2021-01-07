import { InteractiveModel } from "@/models";
import { MutationTree } from "vuex";
import { InteractiveState, StudentId, Target } from "./state";

export interface InteractiveMutationInterface<S> {
  setDesignatingTarget(s: S, p: { isDesignatingTarget: boolean }): void;
  setTargets(s: S, p: { targets: Array<Target> }): void;
  setLocalTargets(s: S, p: { targets: Array<string> }): void;
  setInfo(s: S, p: InteractiveModel): void;
  setStudentsSelected(s: S, p: { studentsSelected: Array<StudentId> }): void;
  setCurrentUserId(s: S, userId: string): void;
  setRevealedTarget(s: S, targetId: string): void;
  setRevealedLocalTarget(s: S, p: Array<string>): void;
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
  setLocalTargets(s: InteractiveState, p: { targets: Array<string> }) {
    s.localTargets = p.targets;
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
  setRevealedTarget(s: InteractiveState, targetId: string) {
    const selectedTarget = s.targets.find((t) => t.id === targetId);
    if (selectedTarget) selectedTarget.reveal = true;
  },
  setRevealedLocalTarget(s: InteractiveState, p: Array<string>) {
    s.localTargets = s.localTargets.concat(p);
  },
};

export default mutations;