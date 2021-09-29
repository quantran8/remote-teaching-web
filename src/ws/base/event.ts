import { StudentWSEvent, StudentWSEventHandler } from "../student";
import { TeacherWSEvent, TeacherWSEventHandler } from "../teacher";
import { RoomWSEvent, RoomWSEventHandler } from "../room";

export type WSEvent = StudentWSEvent | TeacherWSEvent | RoomWSEvent;

export type WSEventHandler = StudentWSEventHandler & TeacherWSEventHandler & RoomWSEventHandler;
