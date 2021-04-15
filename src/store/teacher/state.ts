import { RoomModel, TeacherClassModel } from "@/models";
import { ResourceModel } from "@/models/resource.model";
import { UserModel } from "@/models/user.model";

export interface TeacherState {
  info?: UserModel;
  schools: Array<ResourceModel>;
  classes: Array<TeacherClassModel>;
  classesOrigin: Array<TeacherClassModel>;
  classesAccessible: Array<any>;
  room?: RoomModel;
}

const state: TeacherState = {
  info: undefined,
  schools: [],
  classes: [],
  classesOrigin: [],
  classesAccessible: [],
  room: undefined,
};

export default state;
