import { ClassModel, RoomModel } from "@/models";
import { ResourceModel } from "@/models/resource.model";
import { UserModel } from "@/models/user.model";
import { MutationTree } from "vuex";
import { TeacherState } from "./state";

const mutations: MutationTree<TeacherState> = {
  setSchools(state: TeacherState, payload: Array<ResourceModel>) {
    state.schools = payload;
  },
  setClasses(state: TeacherState, payload: Array<ClassModel>) {
    if(payload && payload.length!=0){
      state.classesOrigin = payload;
    }
    if(state.classesAccessible){
      state.classes = state.classesOrigin.filter(s => state.classesAccessible.find(cl => cl.id = s.schoolClassId))
    }
    state.classes.forEach((cl) => {
      cl.isActive = state.room?.classId === cl.schoolClassId;
    });
  },
  setClassesAccessible(state: TeacherState, payload: Array<any>) {
    state.classesAccessible = payload;
    if(state.classesOrigin && state.classesOrigin.length!=0){
      state.classes = state.classesOrigin.filter(s=>state.classesAccessible.find(item=>item.id === s.schoolClassId))
    }
  },
  setClassRoom(state: TeacherState, payload: RoomModel) {
    state.room = payload;
    state.classes.forEach((cl) => {
      cl.isActive = state.room?.classId === cl.schoolClassId;
    });
  },
  setInfo(state: TeacherState, payload: UserModel) {
    state.info = payload;
  },
};

export default mutations;
