import { defineComponent, PropType } from "@vue/runtime-core";
// import { Component, Vue, Prop } from "vue-property-decorator";

// @Component({
// 	components: {}
// })
// export default class MatIcon extends Vue {
// 	@Prop()
// 	public readonly type!: string;
// }

export default defineComponent({
  components: {},
  props: {
    type: String,
  },
});
