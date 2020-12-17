import { StudentWSEvent, StudentWSEventHandler } from "../student";
import { RoomWSEvent, RoomWSEventHandler } from "../room";
import { TeacherWSEvent, TeacherWSEventHandler } from "../teacher";

export type WSEvent = RoomWSEvent | StudentWSEvent | TeacherWSEvent;

export type WSEventHandler = RoomWSEventHandler &
  StudentWSEventHandler &
  TeacherWSEventHandler;
