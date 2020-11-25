import { ClassModel } from "@/models";
import { UserModel } from "@/models/user.model";

export interface TeacherState {
  info?: UserModel;
  currentClassId?: string;
  classes: Array<ClassModel>;
}

const state: TeacherState = {
  info: undefined,
  currentClassId: undefined,
  classes: [],
};

export default state;
