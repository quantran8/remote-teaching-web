import { Paths } from "./paths";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $paths: typeof Paths;
  }
}
