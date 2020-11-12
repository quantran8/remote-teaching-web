import { Parent } from "@/models/parent.model";
import { ChildModel } from "@/services";

export interface ParentState {
  info: Parent | null;
  children: Array<ChildModel>;
}

const state: ParentState = {
  info: null,
  children: [],
};

export default state;
