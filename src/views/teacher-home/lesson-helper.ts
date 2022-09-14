import { UnitAndLesson, UnitAndLessonModel } from "@/models";
import { RemoteTeachingService } from "@/services";

export const getListUnitByClassAndGroup = async (classId: string, groupId: string) => {
  const response = await RemoteTeachingService.getListLessonByUnit(classId, groupId, -1);
  const listUnit: UnitAndLesson[] = [];

  if (response && response.success) {
    response.data.map((res: UnitAndLessonModel) => {
      let isUnitExist = false;
      listUnit.map((singleUnit: UnitAndLesson) => {
        if (res.unitId == singleUnit.unitId) {
          isUnitExist = true;
        }
      });
      if (!isUnitExist) {
        listUnit.push({ unit: res.unit, sequence: [], unitId: res.unitId });
      }
    });
    response.data.map((res: UnitAndLessonModel) => {
      listUnit.map((singleUnit: UnitAndLesson, index) => {
        if (res.unitId == singleUnit.unitId) {
          listUnit[index].sequence.push(res.sequence);
        }
      });
    });
  }
  listUnit.sort((a, b) => a.unit - b.unit);
  return listUnit;
};
