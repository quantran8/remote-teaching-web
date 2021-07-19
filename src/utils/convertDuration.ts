export const getSeconds = (time: string) => {
  if (!time || time.indexOf(":") === -1) return 0;
  const totalSecondsArr: Array<number> = time.split(":").map((e, index) => {
    const val = parseInt(e);
    if (index === 0) return val * 60 * 60;
    if (index === 1) return val * 60;
    return val;
  });
  let sum = 0;
  for (const s of totalSecondsArr) sum += s;
  return sum;
};
const toStr = (val: number): string => {
  return `${val < 10 ? "0" : ""}${val}`;
};

export const secondsToTimeStr = (time: number): string => {
  const hh = Math.floor(time / 3600);
  const mm = Math.floor((time - hh * 3600) / 60);
  const ss = time % 60;
  return `${toStr(mm + hh * 60)}:${toStr(ss)}`;
};
