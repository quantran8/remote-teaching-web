import { computed, defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { Select, Button } from "ant-design-vue";
import { debounce } from "lodash";
import { LoginInfo } from "@/commonui";
import { TeacherClassModel } from "@/models";
import { ResourceModel } from "@/models/resource.model";
import { AccessibleClassQueryParam, AccessibleSchoolQueryParam, RemoteTeachingService } from "@/services";
import ClassGroupItem from "./components/class-group-item/class-group-item.vue";
import { CAMPUS_NAME, SESSION_START_MINUTE_DIFF } from "@/utils/constants";

export default defineComponent({
	components: {
		ClassGroupItem,
		Select,
		Option: Select.Option,
		Button
	},
	setup() {
		const store = useStore();
		const router = useRouter();
		const schools = computed<ResourceModel[]>(() => store.getters["teacher/schools"]);
		const classes = computed<TeacherClassModel[]>(() => store.getters["teacher/classes"]);
		const username = computed(() => store.getters["auth/username"]);
		const logginInfo: LoginInfo = store.getters["auth/loginInfo"];
		const loading = ref<boolean>(false);
		const disabled = ref<boolean>(false);
		const filteredSchools = ref<ResourceModel[]>(schools.value);

		const getSchools = async () => {
			loading.value = true;
			await store.dispatch("teacher/loadAccessibleSchools", {
				disabled: false,
			} as AccessibleSchoolQueryParam);

			filteredSchools.value = schools.value;

			loading.value = false;
		};

		const onSchoolChange = async (schoolId: string) => {
			loading.value = true;

			await store.dispatch("teacher/loadAccessibleClasses", {
				schoolId,
				disabled: false,
				isDetail: false,
				isCampusDetail: true,
				sortBy: CAMPUS_NAME
			} as AccessibleClassQueryParam);

			filteredSchools.value = schools.value;
			loading.value = false;
		};

		onMounted(async () => {
			if (logginInfo && logginInfo.loggedin) {
				await getSchools();

				if (schools.value?.length) {
					onSchoolChange(schools.value[0].id);

					if (schools.value.length === 1) {
						disabled.value = true;
					}
				}
			}
		});

		const startClass = async (teacherClass: TeacherClassModel) => {
			try {
				// const lessons = await LessonService.getLessonByUnit(11);
				// let lesson = lessons.find((ele) => parseInt(ele.title) === 16);
				// if (!lesson) lesson = lessons[0];
				const response = await RemoteTeachingService.teacherStartClassRoom(
					teacherClass.schoolClassId,
					teacherClass.schoolClassId
				);
				if (response && response.success) {
					router.push("/class/" + teacherClass.schoolClassId);
				} else {
					console.log(response);
				}
			} catch (err) {
				if (err && err.body) {
					const responseError: {
						data: {
							Code: string;
							Message: string;
							Success: boolean;
						};
						success: boolean;
					} = err.body;
					if (responseError && !responseError.success) {
						console.log("ERROR", responseError.data.Message);
					}
				}
			}
		};

		const onClickClass = (teacherClass: TeacherClassModel) => {
			if (teacherClass.isActive) {
				router.push("/class/" + teacherClass.schoolClassId);
			} else {
				startClass(teacherClass);
			}
		};

		const onClickGroup = (schoolClassId: string) => {
			const schoolClass = classes.value.find(cl => cl.schoolClassId === schoolClassId);

			if (schoolClass) {
				onClickClass(schoolClass);
			}
		};

		const canStartSession = (nextSchedule: any) => {
			const now: any = new Date();
			const diff = (nextSchedule - now) / (1000 * 60);
			let canStart = false;

			if (diff <= SESSION_START_MINUTE_DIFF) {
				canStart = true;
			}

			return canStart;
		};

		const filterSchools = debounce((input: string) => {
			if (input) {
				filteredSchools.value = schools.value.filter(school => school.name.toLowerCase().indexOf(input.toLowerCase()) >= 0);
			} else {
				filteredSchools.value = schools.value;
			}
		}, 500);

		return {
			schools,
			filteredSchools,
			classes,
			username,
			loading,
			disabled,
			onClickClass,
			onClickGroup,
			onSchoolChange,
			canStartSession,
			filterSchools
		};
	}
});
