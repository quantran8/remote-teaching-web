import { debounce } from "lodash";
import { ref } from "vue";

export enum Breackpoint {
  // X-Small devices (portrait phones, less than 576px)
  ExtraSmall = 0,

  // Small devices (landscape phones, 576px and up)
  Small = 576,

  // Medium devices (tablets, 768px and up)
  Medium = 768,

  // Large devices (desktops, 992px and up)
  Large = 992,

  // X-Large devices (large desktops, 1200px and up)
  ExtraLarge = 1200,

  // XX-Large devices (larger desktops, 1400px and up)
  DoubleExtraLarge = 1400,
}

export const breakpointChange = (() => {
  const breakpoints: Breackpoint[] = [
    Breackpoint.ExtraSmall,
    Breackpoint.Small,
    Breackpoint.Medium,
    Breackpoint.Large,
    Breackpoint.ExtraLarge,
    Breackpoint.DoubleExtraLarge,
  ];
  const getCurrentBreakpoint = (width: number): Breackpoint => {
    const breakpoint = breakpoints.find((b, index) => {
      const currentSize = b;
      const nextSize = breakpoints[index + 1] || Infinity;
      return currentSize <= width && width < nextSize;
    });
    return breakpoint || breakpoints[0];
  };

  const state = ref<Breackpoint>(getCurrentBreakpoint(window.innerWidth));

  const resizeHandler = debounce(() => {
    state.value = getCurrentBreakpoint(window.innerWidth);
  }, 100);

  window.addEventListener("resize", resizeHandler);

  return () => state;
})();
