import { randomUUID } from "@/utils/utils";

export interface StudentState {
  id: string;
  index: number;
  name: string;
  avatar: string;
  badge: number;
  hasJoinned: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
}
export interface TeacherState {
  id: string;
  name: string;
  avatar: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export interface ClassState {
  view: number;
  teacher: TeacherState;
  students: Array<StudentState>;
}

const state: ClassState = {
  view: 2,
  teacher: {
    id: randomUUID(),
    name: "Teacher's name",
    avatar: "",
    audioEnabled: true,
    videoEnabled: true,
  },
  students: [
    {
      id: randomUUID(),
      index: 0,
      name: "Student Name",
      avatar: "",
      badge: 1,
      hasJoinned: false,
      audioEnabled: false,
      videoEnabled: true,
    },
    {
      id: randomUUID(),
      index: 1,
      name: "Student Name",
      avatar: "",
      badge: 1,
      hasJoinned: false,
      audioEnabled: false,
      videoEnabled: true,
    },
    {
      id: randomUUID(),
      index: 2,
      name: "Student Name",
      avatar: "",
      badge: 1,
      hasJoinned: false,
      audioEnabled: false,
      videoEnabled: true,
    },
    {
      id: randomUUID(),
      index: 3,
      name: "Student Name",
      avatar: "",
      badge: 1,
      hasJoinned: false,
      audioEnabled: false,
      videoEnabled: true,
    },
    {
      id: randomUUID(),
      index: 4,
      name: "Student Name",
      avatar: "",
      badge: 1,
      hasJoinned: false,
      audioEnabled: false,
      videoEnabled: true,
    },
    {
      id: randomUUID(),
      index: 5,
      name: "Student Name",
      avatar: "",
      badge: 1,
      hasJoinned: false,
      audioEnabled: false,
      videoEnabled: true,
    },
    {
      id: randomUUID(),
      index: 6,
      name: "Student Name",
      avatar: "",
      badge: 1,
      hasJoinned: false,
      audioEnabled: false,
      videoEnabled: true,
    },
    {
      id: randomUUID(),
      index: 7,
      name: "Student Name",
      avatar: "",
      badge: 1,
      hasJoinned: false,
      audioEnabled: false,
      videoEnabled: true,
    },
    {
      id: randomUUID(),
      index: 8,
      name: "Student Name",
      avatar: "",
      badge: 1,
      hasJoinned: false,
      audioEnabled: false,
      videoEnabled: true,
    },
    {
      id: randomUUID(),
      index: 9,
      name: "Student Name",
      avatar: "",
      badge: 1,
      hasJoinned: false,
      audioEnabled: false,
      videoEnabled: true,
    },
    {
      id: randomUUID(),
      index: 10,
      name: "Student Name",
      avatar: "",
      badge: 1,
      hasJoinned: false,
      audioEnabled: false,
      videoEnabled: true,
    },
    {
      id: randomUUID(),
      index: 11,
      name: "Student Name",
      avatar: "",
      badge: 1,
      hasJoinned: false,
      audioEnabled: false,
      videoEnabled: true,
    },
  ],
};

export default state;
