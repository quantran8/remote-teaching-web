import { ClassModel } from "@/models/class.model";
import { UserModel } from "@/models/user.model";

export interface TeacherState {
  info: UserModel | null;
  classes: Array<ClassModel>;
}

const state: TeacherState = {
  info: null,
  classes: [],
};

export default state;
