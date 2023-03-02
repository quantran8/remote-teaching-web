export const getStudentPositionAndSize = (displayName: string, element: HTMLCanvasElement | HTMLDivElement) => {
  const div = document.getElementById(`${displayName}__sub-wrapper`) as HTMLDivElement;
  const subDiv = document.getElementById(`${displayName}__wrapper`) as HTMLDivElement;
  if (element && div && subDiv) {
    const w = div.offsetWidth === subDiv.offsetWidth ? div.offsetWidth : subDiv.offsetWidth;
    const h = div.offsetHeight;
    const x = div.offsetWidth === subDiv.offsetWidth ? div.offsetLeft : subDiv.offsetLeft;
    const y = element.offsetHeight - (div.offsetTop + div.offsetHeight);
    return { w, h, x, y };
  }
  return null;
};

export const getClassmatePositionAndSize = (displayName: string, canvas: HTMLCanvasElement) => {
  const div = document.getElementById(`${displayName}__sub-wrapper`) as HTMLDivElement;
  if (canvas && div) {
    const w = div.offsetWidth;
    const h = div.offsetHeight;
    const x = div.parentElement?.offsetLeft ?? 0;
    const y = canvas.offsetHeight - (div.offsetHeight + (div.parentElement?.offsetTop ?? 0));
    return { w, h, x, y };
  }
  return null;
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
