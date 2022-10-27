import { computed, defineComponent, ref, onMounted, watch } from 'vue';
import {Radio,Select, Button, Calendar, Input, Table, Modal } from "ant-design-vue";
import { useStore } from 'vuex';
import moment, {Moment} from 'moment';
import { AccessibleSchoolQueryParam } from '@/services';
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useRoute } from 'vue-router';
import { StudentState } from '@/store/room/interface';
import { RoomModel } from '@/models';
import { FilterMode } from '@/utils/utils';
import { BlobTagItem } from '@/services/storage/interface';
import { StudentsGroup } from '@/store/teacher/state';
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import "vue3-carousel/dist/carousel.css";
const fpPromise = FingerprintJS.load();

export default defineComponent({
	components:{
		Radio,
		RadioGroup:Radio.Group,
		Select,
		Option:Select.Option,
		Button,
		Calendar,
		Input,
		Table,
		Modal,
		Carousel,
		Slide,
		Pagination,
		Navigation
	},
	setup(){
		const settings = ref({
			"dots": true,
			"dotsClass": "slick-dots custom-dot-class",
			"edgeFriction": 0.35,
			"infinite": false,
			"speed": 500,
			"slidesToShow": 1,
			"slidesToScroll": 1
		})
		const { getters, dispatch} = useStore();
		const {schoolId,studentId} = useRoute().params;
		console.log(schoolId,studentId)
		const classesSchedules = computed(() => getters["teacher/classesSchedules"]);
		const schools = computed(() => getters["teacher/schools"]);
		const studentsGroup = computed<Array<StudentsGroup>>(() => getters["teacher/currentStudentsGroup"]);
		const children = computed(() => getters["parent/children"]);
		const students = computed<Array<StudentState>>(() => getters["teacherRoom/students"]);
		const classInfo = computed<RoomModel>(() => getters["teacherRoom/info"]);
		const userInfo = computed(() => getters["auth/getLoginInfo"]);
		const studentsImageCaptured = computed<Array<BlobTagItem>>(() => getters["teacherRoom/studentsImageCaptured"]);
		const listDateByStudent = computed(() => {
			const listDate: Array<string> = [];
			studentsImageCaptured.value.forEach((item) => {
				if(!listDate.includes(item.tags.dateTime)){
					listDate.push(item.tags.dateTime)
				}
			});
			return listDate;
		});
		const listStudentByGroup = computed(() => {
			const listStudent: Array<string> = [];
			studentsImageCaptured.value?.forEach(item => {
				if (!listStudent.includes(item.tags.studentId)) {
					listStudent.push(item.tags.studentId)
				}
			});
			console.log(listStudent)
			return listStudent;
		});


		const schoolOptions = computed(() => schools.value?.map((school: any) => ({value: school.id , label: school.name})) ?? []);
		const classOptions = computed(() => classesSchedules.value?.map((c: any) => ({value: c.classId , label: c.className})) ?? []);
		const studentOptions = computed(() => (studentsGroup.value?.map(student => ({value: student.studentId , label: student.nativeName})) ?? []));
		const groupOptions = computed(() => (classesSchedules.value[0]?.groups.map((group: any) => ({value: group.groupId , label:group.groupName})) ?? []));

		const classSelected = computed(() => {
			if(!classInfo.value){
				return classOptions.value[0]
			}
			if(filterOptions.value.class){
				return {
					value: filterOptions.value.class,
					label: classOptions.value.find((item: any) => item.value === filterOptions.value.class)?.label
				}
			}
			return classInfo.value?.classInfo.classId ? classOptions.value.find((item: any) => item.value === classInfo.value?.classInfo.classId) : classOptions.value[0]
		});
		const groupSelected = computed(() => classInfo.value?.classInfo.groupId ? groupOptions.value.find((item: any) => item.value === classInfo.value?.classInfo.groupId) : groupOptions.value[0]);
		const studentSelected = computed(() => studentId ? studentOptions.value.find((item: any) => item.value === studentId) : studentOptions.value[0]);
		const currentDate = ref<Moment>();
		const isShowCalendar = ref(false);
		const isShowImageModal = ref(false);
		const filterMode = ref(FilterMode.Session);
		const filterOptions = ref({
			filterMode:filterMode.value,
			school:"",
			class: "",
			group: "",
			student: "",
			date:"",
		});
		const carouselDataSource = ref<Array<BlobTagItem>>([]);
		const r = ref<any>();
		const columns = computed(() => [
			{
				title: filterMode.value === FilterMode.Student ? "Session" : "Student",
				dataIndex: filterMode.value === FilterMode.Student ? "session" : "student",
				key: filterMode.value === FilterMode.Student ? "session" : "student",
			},
			{
				title: "Count",
				dataIndex: "count",
				key: 'count',
				slots: { customRender: 'count' },

			},
		])
		const dataSources = computed(() => {
			if (filterMode.value === FilterMode.Student) {
				return listDateByStudent.value.map((date: string) => ({
					key: date,
					session: date,
					count: studentsImageCaptured.value.filter(item => item.tags.dateTime === date).length
				}));
			}
			if(!filterOptions.value.date){
				return listStudentByGroup.value.map(studentId => ({
					key: studentId,
					student: studentsGroup.value.find(student => student.studentId === studentId)?.nativeName,
					count: studentsImageCaptured.value.filter(item => item.tags.studentId === studentId).length
				}));
			}
			return listStudentByGroup.value.map(studentId => ({
				key: studentId,
				student: studentsGroup.value.find(student => student.studentId === studentId)?.nativeName,
				count: studentsImageCaptured.value.filter(item => item.tags.studentId === studentId && item.tags.dateTime === filterOptions.value.date).length
			}));
		}
		)
		
		const handleChangeRadioSelected = async(e: any) => {
			filterMode.value = e.target.value;
			filterOptions.value = {
				school:schoolOptions.value[0].value,
				class:classOptions.value[0].value,
				group:groupOptions.value[0].value,
				student:studentOptions.value[0].value,
				date:"",
				filterMode:e.target.value
			};
			await dispatch('teacher/getClassInfo', {
					classId: filterOptions.value.class,
					groupId: filterOptions.value.group,
					teacherId: userInfo.value.profile.sub
				});
		}
		const handleChangeClass = (value: any) => {
			filterOptions.value = {...filterOptions.value, class:value.value};
		}
		const handleChangeGroup =  async(value: any) => {
			console.log(value.value);
			if(filterMode.value === FilterMode.Student){
				await dispatch('teacher/getClassInfo', {
					classId: filterOptions.value.class,
					groupId: value.value,
					teacherId: userInfo.value.profile.sub
				});
			}
			filterOptions.value = {...filterOptions.value, group:value.value};
		}
		const handleChangeStudent = async (value: any) => {
			console.log(currentDate.value)
			filterOptions.value = {...filterOptions.value, student:value.value};
			}
		const handleChangeSchool = async(value: any) => {
			console.log(filterOptions.value);
			await dispatch("teacher/loadAllClassesSchedules",value.value);
			filterOptions.value = {...filterOptions.value, group:value.value};
		}
		const handleChangeDate = (value: Moment) => {
			// filterOptions.value = {...filterOptions.value, date:value.format("yyyy-MM-DD")};
			carouselDataSource.value = studentsImageCaptured.value.filter(item => 
				item.tags.dateTime === filterOptions.value.date && 
				item.tags.schoolId === filterOptions.value.school && 
				item.tags.groupId === filterOptions.value.group);
			// console.log(value.format("DD-MM-yyyy"));
		}
		const showCalendar = () => {
			isShowCalendar.value = !isShowCalendar.value;
		}
		const myCarousel = ref<any>(null);

		const handleShowImage = (record:any) => {
			isShowImageModal.value = !isShowImageModal.value;
			carouselDataSource.value = studentsImageCaptured.value.filter(item => filterMode.value === FilterMode.Student ? item.tags.dateTime === record.key : item.tags.studentId === record.key);			
		}
		const removeImage = async(imageName: any) => {
			carouselDataSource.value.splice(imageName,1)
			const data = studentsImageCaptured.value.filter(item => item.blobName !== imageName);
			await dispatch("teacherRoom/setStudentsImageCaptured", data)
			await dispatch('teacherRoom/removeStudentImage', {
				token: userInfo.value.access_token,
				fileName:imageName
			});

		}
		const blobNameToUrl = (blobName: string) => {
			return process.env.VUE_APP_STORAGE_URL+blobName;
		}
		const refreshListData = async() => {
			await dispatch('teacherRoom/getStudentCapturedImages', {
				token: userInfo.value.access_token,
				schoolId: filterOptions.value.school,
				sessionId: filterOptions.value.school,
				classId: filterOptions.value.class,
				groupId: filterOptions.value.group,
				studentId: filterOptions.value.student,
				date: filterOptions.value.date,
				filterMode: filterMode.value
			});
		}
		watch(filterOptions, async (value) => {
			await dispatch('teacherRoom/getStudentCapturedImages', {
				token: userInfo.value.access_token,
				schoolId: value.school,
				sessionId: value.school,
				classId: value.class,
				groupId: value.group,
				studentId: value.student,
				date: value.date,
				filterMode: filterMode.value
			});
		}, { deep: true })

		onMounted(async() => {
			const fp = await fpPromise;
			const result = await fp.get();
			const visitorId = result.visitorId;
			await dispatch("teacher/loadAccessibleSchools", {
				disabled: false,
			} as AccessibleSchoolQueryParam);
			await dispatch("teacher/loadAllClassesSchedules", {
				schoolId: schoolId,
				browserFingerPrinting: visitorId,
			});
			await dispatch('teacher/getClassInfo', {
				classId: classSelected.value?.value,
				groupId: groupSelected.value?.value,
				teacherId: userInfo.value.profile.sub
			});
			filterOptions.value = {
				filterMode:filterMode.value,
				school: schoolId as string ?? schoolOptions.value[0].value ,
				class: classSelected.value?.value,
				group: groupSelected.value?.value,
				student: studentSelected.value?.value ?? "",
				date: ""
			}

		})
		return{
			myCarousel,
			filterMode,
			groupOptions,
			children,
			schools,
			classesSchedules,
			currentDate,
			classOptions,
			schoolOptions,
			studentOptions,
			isShowCalendar,
			columns,
			dataSources,
			isShowImageModal,
			filterOptions,
			classSelected,
			groupSelected,
			studentSelected,
			carouselDataSource,
			FilterMode,
			r,
			settings,
			removeImage,
			handleChangeDate,
			handleChangeRadioSelected,
			handleChangeClass,
			handleChangeGroup,
			handleChangeStudent,
			handleChangeSchool,
			showCalendar,
			handleShowImage,
			blobNameToUrl,
			refreshListData
		}
	}
})