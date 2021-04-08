import { defineComponent } from "vue";
import { PlayCircleOutlined } from "@ant-design/icons-vue";
import { formatDate4Y2M2D } from "@/utils/utils";

export default defineComponent({
	components: {
		PlayCircleOutlined
	},
	props: {
		title: {
			type: String,
			required: true,
		},
		studentCount: {
			type: Number,
			required: true,
		},
		nextSchedule: {
			type: Date,
			required: true,
		},
		canStartSession: {
			type: Function,
			required: true
		},
		isHighlight: {
			type: Boolean
		},
	},
	setup(props) {
		const style = props.isHighlight ? "border: 1px solid #ff0;" : null;

		return { formatDate: formatDate4Y2M2D, style };
	},
});
