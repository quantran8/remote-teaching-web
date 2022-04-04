declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'fabric';
declare module 'vue-glcommonui';

declare module 'vue-dragscroll';
declare module 'vue-cropperjs';
// declare const UnityLoader;

declare module 'vue-lottie'

declare module "*.json" {
	const value: any;
	export default value;
  }
