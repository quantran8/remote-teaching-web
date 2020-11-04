import { randomUUID } from "@/utils/utils";

export enum StudentInClassStatus {
  /**Student is not join the class yet */
  DEFAULT = 0,
  /**
   * Student send a request to Join the class, it depends on the setting of the class. If student can join class at any time without any restrictions then this value is not in use.
   */
  REQUESTING = 1,
  /**
   * Student is now in the class
   */
  JOINED = 2,
  /**
   * Student is about to leave the class
   */
  LEAVING = 3,
  /**
   * Student has left the class
   */
  LEFT = 4,
}
export enum StreamingStatus {
  WAITING = 0,
  CONNECTING = 1,
  CONNECTED = 2,
  DISCONNECTED = 3,
}

export interface StudentState {
  id: string;
  index: number;
  name: string;
  avatar: string;
  badge: number;
  hasJoinned: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  status: StudentInClassStatus;
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
      status: 0,
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
      status: 0,
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
      status: 0,
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
      status: 0,
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
      status: 0,
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
      status: 0,
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
      status: 0,
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
      status: 0,
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
      status: 0,
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
      status: 0,
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
      status: 0,
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
      status: 0,
    },
  ],
};

export default state;
