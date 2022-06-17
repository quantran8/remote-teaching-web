export const getPositionAndSize = (isHost: boolean, displayName: string) => {
  const canvas = document.getElementById("participant-videos") as HTMLCanvasElement;
  const div = document.getElementById(`${displayName}__sub-wrapper`) as HTMLDivElement;
  if (canvas && div) {
    const offsetHeight = isHost ? div.offsetHeight : div.offsetWidth;
    const scaleX = canvas.width / canvas.offsetWidth;
    const scaleY = canvas.height / canvas.offsetHeight;
    const w = div.offsetWidth * scaleX;
    const h = offsetHeight * scaleY;
    const x = div.offsetLeft * scaleX;
    const y = (canvas.offsetHeight - (div.offsetTop + offsetHeight)) * scaleY;
    return { w, h, x, y };
  }
  return null
};
