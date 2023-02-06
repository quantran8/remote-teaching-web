import { HelperWSEvent, HelperWSEventHandler } from "../helper";
import { RoomWSEvent, RoomWSEventHandler } from "../room";
import { StudentWSEvent, StudentWSEventHandler } from "../student";
import { TeacherWSEvent, TeacherWSEventHandler } from "../teacher";

export type WSEvent = StudentWSEvent | TeacherWSEvent | RoomWSEvent | HelperWSEvent;

export type WSEventHandler = StudentWSEventHandler & TeacherWSEventHandler & RoomWSEventHandler & HelperWSEventHandler;
