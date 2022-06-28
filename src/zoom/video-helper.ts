export const getStudentPositionAndSize = (displayName: string, canvas: HTMLCanvasElement) => {
  const div = document.getElementById(`${displayName}__sub-wrapper`) as HTMLDivElement;
  if (canvas && div) {
    const w = div.offsetWidth;
    const h = div.offsetHeight;
    const x = div.offsetLeft;
    const y = canvas.offsetHeight - (div.offsetTop + div.offsetHeight);
    return { w, h, x, y };
  }
  return null;
};

export const getClassmatePositionAndSize = (displayName: string, canvas: HTMLCanvasElement) => {
  const div = document.getElementById(`${displayName}__sub-wrapper`) as HTMLDivElement;
  if (canvas && div) {
    const w = div.offsetWidth;
    const h = div.offsetWidth;
    const x = div.offsetLeft;
    const y = canvas.offsetHeight - (div.offsetTop + div.offsetWidth);
    return { w, h, x, y };
  }
  return null;
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
