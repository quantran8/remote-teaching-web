import { StudentWSEvent, StudentWSEventHandler } from "../student";
import { TeacherWSEvent, TeacherWSEventHandler } from "../teacher";

export type WSEvent = StudentWSEvent | TeacherWSEvent;

export type WSEventHandler = StudentWSEventHandler & TeacherWSEventHandler;
