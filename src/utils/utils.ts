import { GroupModel } from "@/models/group.model";
import { v4 as uuidv4 } from "uuid";

export const randomUUID = (prefix?: string): string => {
	return `${prefix ? prefix : ""}${uuidv4()}`;
};

const generateRandomStudentCount = () => Math.floor(Math.random() * 10 + 1);

export const createMockGroups = (schoolClassId: string) => {
	const random = Math.floor(Math.random() * 3 + 1);

	return [...Array(random).keys()].map(index => ({
		id: index + "",
		name: `Group-${index + 1}`,
		studentCount: generateRandomStudentCount(),
		nextSchedule: new Date(),
		schoolClassId
	}) as GroupModel);
};

export const formatDate4Y2M2D = (date: Date) => {
	const mm = date.getMonth() + 1; // getMonth() is zero-based
	const dd = date.getDate();
	const hh = date.getHours();
	const min = date.getMinutes();

	return `${date.getFullYear()}/${(mm > 9 ? "" : "0") + mm}/${(dd > 9 ? "" : "0") + dd} ${hh}:${min}`;
};
