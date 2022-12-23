import { randomUUID } from "@/utils/utils";
import { FabricObject } from "@/ws";
import { fabric } from "fabric";
import FontFaceObserver from "fontfaceobserver";
import { computed, ref, watch } from "vue";
import { DefaultCanvasDimension } from "vue-glcommonui";
import { useStore } from "vuex";
const FontDidactGothic = "Didact Gothic";
const FontLoader = new FontFaceObserver(FontDidactGothic);

// eslint-disable-next-line
fabric.Textbox.prototype._wordJoiners = /[]/;

const defaultTextBoxProps = {
  left: 50,
  top: 50,
  fontSize: 36,
  fill: "black",
  padding: 5,
  fontFamily: FontDidactGothic,
  originX: "center",
  originY: "center",
};

const deserializeFabricObject = (item: FabricObject) => {
  const { fabricData, fabricId } = item;
  const fabricObject = JSON.parse(fabricData);
  fabricObject.objectId = fabricId;
  return fabricObject;
};

export const useFabricObject = () => {
  const { dispatch, getters } = useStore();
  const isTeacher = computed(() => getters["auth/isTeacher"]);
  const currentExposureItemMedia = computed(() => getters["lesson/currentExposureItemMedia"]);
  const oneToOneId = computed(() => getters["teacherRoom/getStudentModeOneId"]);
  const nextColor = ref("");
  const currentSelectionEnd = ref(-1);
  const currentSelectionStart = ref(-1);
  const isChangeImage = ref(false);
  const isTeacherUseOnly = computed(() => getters["teacherRoom/isTeacherUseOnly"]);

  watch(currentExposureItemMedia, (currentItem, prevItem) => {
    if (currentItem && prevItem) {
      if (currentItem.id !== prevItem.id) {
        isChangeImage.value = true;
      }
    }
  });

  watch(oneToOneId, (currentOneToOneId, prevOneToOneId) => {
    if (currentOneToOneId !== prevOneToOneId && isChangeImage.value) {
      isChangeImage.value = false;
    }
  });

  const isEditing = ref(false);
  const onObjectCreated = (canvas: any) => {
    canvas.on("object:added", (options: any) => {
      const handleSelect = () => {
        if (options?.target.type === "textbox" && !isTeacher.value) {
          options.target.selectable = false;
        }
        if (options?.target.type === "path") {
          options.target.selectable = false;
          options.target.perPixelTargetFind = true;
          options.target.hoverCursor = "default";
        }
      };
      handleSelect();
    });
  };
  const onObjectModified = (canvas: any) => {
    canvas.on("object:modified", (options: any) => {
      if (options?.target?.type === "group" && options.action === "drag") {
        const { target } = options.transform;
        const viewPortX = Math.abs(canvas.viewportTransform[4]);
        const viewPortY = Math.abs(canvas.viewportTransform[5]);
        const zoom = canvas.getZoom();
        const clipPathLeft = DefaultCanvasDimension.width - target.width;
        const clipPathTop = DefaultCanvasDimension.height - target.height;
        const originX = target.width / 2;
        const originY = target.height / 2;

        if (target.width * zoom < DefaultCanvasDimension.width) {
          if (target.left !== DefaultCanvasDimension.width / 2) {
            target.left = DefaultCanvasDimension.width / 2;
          }
        } else {
          if (target.left - viewPortX / zoom > originX) {
            target.left = originX + viewPortX / zoom;
          } else {
            if (target.left + viewPortX / zoom < originX + clipPathLeft) {
              target.left = originX + clipPathLeft - viewPortX / zoom;
            }
          }
        }
        if (target.height * zoom < DefaultCanvasDimension.height) {
          if (target.top !== target.height / 2) {
            target.top = target.height / 2 + viewPortY / zoom;
          }
        } else {
          if (target.top - viewPortY / zoom > originY) {
            target.top = originY + viewPortY / zoom;
          } else {
            if (target.top + viewPortY / zoom < originY) {
              target.top = originY + clipPathTop - viewPortY / zoom;
            }
          }
        }
        target.setCoords();
        const coords = {
          x: Math.floor(target.left) ?? 0,
          y: Math.floor(target.top) ?? 0,
          viewPortX: Math.floor(viewPortX),
          viewPortY: Math.floor(viewPortY),
        };
        if (canvas.getZoom() !== 1 && !isTeacherUseOnly.value) {
          dispatch("teacherRoom/setMoveZoomedSlide", coords);
          dispatch("lesson/setImgCoords", coords, { root: true });
        }
      }
      if (options?.target?.type === "textbox") {
        if (!isChangeImage.value && !isTeacherUseOnly.value) {
          dispatch("teacherRoom/teacherModifyFabricObject", options?.target);
        }
        if (options?.target.text === "") {
          canvas.remove(options.target);
        }
      }
      if (isChangeImage.value) {
        isChangeImage.value = false;
      }
    });
  };
  const onTextBoxEdited = (canvas: any) => {
    canvas.on("text:editing:exited", (options: any) => {
      if (options?.target.type === "textbox") {
        if (options?.target.text === "" || !options?.target.textIsChanged) {
          setTimeout(() => {
            canvas.remove(options.target);
          }, 0);
        }
      }
    });

    canvas.on("text:selection:changed", (options: any) => {
      currentSelectionEnd.value = options.target.selectionEnd;
      currentSelectionStart.value = options.target.selectionStart;
    });
    canvas.on("text:editing:entered", (options: any) => {
      if (options?.target.type === "textbox") {
        options.target.set("cursorColor", nextColor.value);
        isEditing.value = true;
        options.target.setSelectionStart(0);
        options.target.setSelectionEnd(options.target.text.length);
      }
    });

    canvas.on("text:changed", (options: any) => {
      // adjust textbox size when remove characters
      if (options.target instanceof fabric.IText) {
        const maxLength = Math.max(...options.target.textLines.map((line: string) => line.length));
        options.target.set({ width: maxLength });
      }
      if (!options.target.textIsChanged) {
        options.target.textIsChanged = true;
      }
      let startIndex = -1;
      let endIndex = -1;
      if (nextColor.value) {
        if (currentSelectionEnd.value === currentSelectionStart.value) {
          if (options.target?.prevTextValue?.length < options.target?.text?.length) {
            startIndex = currentSelectionEnd.value;
            endIndex = options.target.selectionEnd;
          }
        } else {
          startIndex = currentSelectionStart.value;
          endIndex = options.target.selectionEnd;
        }
      }
      if (startIndex > -1 && endIndex > -1) {
        const selectedTextStyles = options.target.getSelectionStyles(startIndex, endIndex, true);
        if (selectedTextStyles?.some((style: any) => style && style.fill !== nextColor.value)) {
          options.target.setSelectionStart(startIndex);
          options.target.setSelectionEnd(endIndex);
          options.target.setSelectionStyles({ fill: nextColor.value });
          options.target.setSelectionStart(options.target.selectionEnd);
          options.target.setSelectionEnd(options.target.selectionEnd);
        }
      }
      options.target.prevTextValue = options.target.text;
      currentSelectionEnd.value = options.target.selectionEnd;
      currentSelectionStart.value = options.target.selectionEnd;
      if (!isTeacherUseOnly.value) {
        dispatch("teacherRoom/teacherModifyFabricObject", options?.target);
      }
    });
  };

  const createTextBox = (canvas: any, coords: { top: number; left: number }) => {
    const textBox = new fabric.Textbox("", { ...defaultTextBoxProps, ...coords, fill: nextColor.value });
    const randomId = randomUUID();
    textBox.objectId = randomId;
    textBox.prevTextValue = "";
    canvas.add(textBox).setActiveObject(textBox);
    textBox.textIsChanged = false;
    textBox.enterEditing();
    textBox.setSelectionStart(0);
    textBox.setSelectionEnd(textBox.text.length);
    if (!isTeacherUseOnly.value) {
      dispatch("teacherRoom/teacherCreateFabricObject", textBox);
    }
    return textBox;
  };

  //display the fabric items get from getRoomInfo API which save in vuex store
  const displayFabricItems = (canvas: any, items: FabricObject[]) => {
    for (const item of items) {
      const currentObjects = canvas.getObjects();
      const existing = currentObjects.find((obj: any) => obj.objectId === item.fabricId);
      if (existing) {
        const fabricObject = deserializeFabricObject(item);
        const { type } = fabricObject;
        switch (type) {
          case "textbox":
            FontLoader.load().then(() => {
              canvas.add(new fabric.Textbox("", fabricObject));
            });
            break;
          default:
            break;
        }
        return;
      }
      displayCreatedItem(canvas, item);
    }
  };

  //display the fabric item get from signalR TeacherCreateFabricObject/TeacherModifyFabricObject
  //which save in vuex store as lastFabricUpdated
  const displayCreatedItem = (canvas: any, item: FabricObject) => {
    const fabricObject = deserializeFabricObject(item);
    const { type } = fabricObject;
    switch (type) {
      case "textbox": {
        const emptyTextBox = canvas.getObjects().find((obj: any) => obj.type === "textbox" && !obj.text);
        if (emptyTextBox) {
          canvas.remove(emptyTextBox);
        }
        FontLoader.load().then(() => {
          canvas.add(new fabric.Textbox("", fabricObject));
        });
        break;
      }
      default:
        break;
    }
  };

  const displayModifiedItem = (canvas: any, item: FabricObject, existingItem: any) => {
    const fabricObject = deserializeFabricObject(item);
    const { type } = fabricObject;
    switch (type) {
      case "textbox":
        //two lines below fix the bug the text not display when texts's width not equal the Box's width (it can be fabric issue)
        if (fabricObject.text.length === 1) fabricObject.width = 0;
        existingItem.set(fabricObject);
        canvas.renderAll();
        break;
      default:
        break;
    }
  };

  const handleUpdateColor = (canvas: any, colorValue: string) => {
    const selectedFabricObject = canvas.getActiveObject();
    nextColor.value = colorValue;
    if (selectedFabricObject?.type === "textbox") {
      const hasSelected = selectedFabricObject.selectionEnd - selectedFabricObject.selectionStart > 0;
      if (hasSelected) {
        selectedFabricObject.setSelectionStyles({ fill: colorValue });
        if (!isTeacherUseOnly.value) {
          dispatch("teacherRoom/teacherModifyFabricObject", selectedFabricObject);
        }
      }
      selectedFabricObject.set("cursorColor", colorValue);
      canvas.renderAll();
    }
  };

  return {
    onObjectCreated,
    createTextBox,
    onTextBoxEdited,
    onObjectModified,
    displayFabricItems,
    displayCreatedItem,
    displayModifiedItem,
    isEditing,
    nextColor,
    FontLoader,
    handleUpdateColor,
  };
};
