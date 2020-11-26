import { Parent } from "@/models";
import { ChildModel } from "@/services";

export interface ParentState {
  info: Parent | null;
  children: Array<ChildModel>;
  selectedChild?: ChildModel;
}

const state: ParentState = {
  info: null,
  children: [],
  selectedChild: undefined,
};

export default state;
