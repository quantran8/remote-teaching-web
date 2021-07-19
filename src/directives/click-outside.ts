export default {
  beforeMount: (el: any, binding: any) => {
    const ourClickEventHandler = (event: any) => {
      if (!el.contains(event.target) && el !== event.target) {
        binding.value(event); // before binding it
      }
    };
    el.__vueClickEventHandler__ = ourClickEventHandler;
    document.addEventListener("click", ourClickEventHandler);
  },
  unmounted: (el: any) => {
    document.removeEventListener("click", el.__vueClickEventHandler__);
  },
};
