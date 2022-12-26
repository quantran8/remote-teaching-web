<template>
	<div class="class_setup">
		<div class="class_setup_header">
			<p class="title_text">{{ dateTime }}</p>
		</div>
		<div class="class_setup_container">
			<div class="class_info">
			<div class="class_info_session">
				<p class="title_text">{{schoolName}}</p>
				<p class="title_text">{{campusName}}</p>
				<p class="title_text">{{className}}</p>
				<p v-if="groupName" class="title_text">{{groupText}} {{groupName}}</p>
			</div>
			<div v-if="isTeacherSetup" class="class_info_unit-lesson">
				<Row align="start" class="device-tester__mb--default">
					<div class="ant-col-24 ant-col-sm-18">
					<Space size="large" align="center">
						<Space size="small" align="center">
						<label>{{ Unit }}</label>
						<Select v-model:value="currentUnit" class="device-tester__unit-lesson" ref="select" @change="handleUnitChange">
							<SelectOption v-for="item in unitInfo" :key="item.unit" :value="item.unit">{{ item.unit }}</SelectOption>
						</Select>
						</Space>
						<Space size="small" align="center">
						<label>{{ Lesson }}</label>
						<Select v-model:value="currentLesson" class="device-tester__unit-lesson" ref="select" @change="handleLessonChange">
							<SelectOption v-for="lesson in listLessonByUnit" :key="lesson" :value="lesson">{{ lesson }}</SelectOption>
						</Select>
						</Space>
					</Space>
					</div>
				</Row>
			</div>
			<div v-if="isTeacherSetup" class="class_info_member">
				<div>
					<p class="title_text">{{ classSetUpStudents.length }} {{ MembersText }}</p>
				</div>
				<div class="class_info_member_active">
					<P class="student_status">{{ ActiveStudentsText }} ({{ activeStudents.length }})</P>
					<div class="list_student">
						<p v-for="st in activeStudents" :key="st.studentId">
						{{ st.studentName }}
						</p>
					</div>
				</div>
				<div class="class_info_member_inactive">
					<P class="student_status">{{ InActiveStudentsText }} ({{ inActiveStudents.length }})</P>
					<div v-if="inActiveStudents.length" class="list_student list_student_inactive">
						<p v-for="st in inActiveStudents" :key="st.studentId" class="">
						{{ st.studentName }}
						</p>
					</div>
				</div>
			</div>
		</div>
		<div class="device_setup">
			<div class="device-tester">
			<Row align="middle" class="device-tester__mb--small">
				<p class="title_text">{{ RemoteSetUpText }}</p>
			</Row>
			<Row align="middle" class="device-tester__mb--small">
				<div class="ant-col-24 ant-col-sm-6">
				<img src="@/assets/icons/speaker.png" class="device-tester-icon"/>
				<span> {{ CheckSpeaker }} </span>
				</div>
				<div class="ant-col-24 ant-col-sm-18">
				<Space size="large" align="center" class="device-tester__check-mic-cam">
					<div class="device-tester__speaker--icon">
					<audio loop id="audio" style="display: none">
						<source src="@/assets/audio/ConnectTestSound.mp3" type="audio/mp3" />
					</audio>
					<img :src="speakerIcon" @click="toggleSpeaker" alt="" class="sound-img"/>
					</div>
					<Select
					:placeholder="SelectDevice"
					style="width: 330px"
					:disabled="!isCheckSpeaker"
					v-model:value="currentSpeakerLabel"
					ref="select"
					@change="handleSpeakerChange"
					>
					<SelectOption v-for="deviceId in listSpeakersId" :key="deviceId" :value="deviceId">
						{{ listSpeakers.find((speaker) => speaker.deviceId === deviceId)?.label }}
					</SelectOption>
					</Select>
					<img v-if="isPlayingSound" src="@/assets/images/audio-wave.gif" class="sound-img" />	
				</Space>
				</div>
				<p v-show="!havePermissionMicrophone">
				<span class="alert-device-test">{{ warningMsgSpeaker }}</span>
				</p>
      		</Row>
			<Row align="middle" class="device-tester__mb--small">
				<div class="ant-col-24 ant-col-sm-6">
				<img src="@/assets/icons/mic.png" class="device-tester-icon"/>
				<span>{{ CheckMic }}</span>
				</div>
				<div class="ant-col-24 ant-col-sm-18">
				<Space size="large" align="center" class="device-tester__check-mic-cam">
					<Switch v-model:checked="isOpenMic" />
					<Select
					:placeholder="SelectDevice"
					class=""
					style="width: 330px"
					:disabled="!isOpenMic"
					v-model:value="currentMicLabel"
					ref="select"
					@change="handleMicroChange"
					>
					<SelectOption v-for="deviceId in listMicsId" :key="deviceId" :value="deviceId">
						{{ listMics.find((mic) => mic.deviceId === deviceId)?.label }}
					</SelectOption>
					</Select>
				</Space>
				</div>
      		</Row>
			<Row align="middle" class="device-tester__mb--default">
				<div class="ant-col-24 ant-col-sm-16 ant-col-sm-offset-6" v-show="listMics.length > 0">
				<Progress :strokeWidth="25" :percent="!isOpenMic ? 0 : volumeByPercent" strokeColor="#5c2d91" :show-info="false" class="progress"/>
				</div>
				<p v-show="!havePermissionMicrophone">
				<span class="alert-device-test">{{ warningMsgMicrophone }}</span>
				</p>
      		</Row>
			<Row align="middle" class="device-tester__mb--small">
				<div class="ant-col-24 ant-col-sm-6">
				<img src="@/assets/icons/videocam.png" class="device-tester-icon"/>
				<span>{{ CheckCam }}</span>
				</div>
				<div class="ant-col-24 ant-col-sm-18">
				<Space size="large" align="center" class="device-tester__check-mic-cam">
					<Switch v-model:checked="isOpenCam" />
					<Select
					:placeholder="SelectDevice"
					style="width: 330px"
					:disabled="!isOpenCam"
					v-model:value="currentCamLabel"
					ref="select"
					@change="handleCameraChange"
					>
					<SelectOption v-for="deviceId in listCamsId" :key="deviceId" :value="deviceId">
						{{ listCams.find((cam) => cam.deviceId === deviceId)?.label }}
					</SelectOption>
					</Select>
				</Space>
				</div>
      		</Row>
			<Row align="middle" class="device-tester__mb--default">
				<p v-show="!havePermissionCamera">
				<span class="alert-device-test">{{ warningMsgCamera }}</span>
				</p>
			</Row>
			<Row align="middle" class="device-tester__mb--default">
				<div class="ant-col-24 ant-col-sm-14">
				<video
					ref="playerRef"
					:id="videoElementId"
					v-show="isOpenCam && currentCam && !zoomCamError"
					v-if="!isUsingAgora"
					:class="['device-tester__camera--player']"
				></video>
				<div
					ref="playerRef"
					:id="videoElementId"
					v-show="isOpenCam && currentCam && !agoraCamError"
					v-if="isUsingAgora"
					:class="['device-tester__camera--player']"
				></div>
				<div v-show="!isOpenCam || agoraCamError || !currentCam" :class="['device-tester__camera--player', 'hided']">
					<div class="device-tester__camera--player__icon">
					<img src="@/assets/video-off-white.svg" alt="" />
					</div>
					<div class="device-tester__camera--player__text">
					{{ CamOff }}
					</div>
				</div>
				</div>
				<div class="ant-col-24 ant-col-sm-10"></div>
			</Row>
			<Row type="flex" justify="center" class="device-tester__mb--small">
				<Space size="large" align="center">
				<span @click="handleCancel" class="device-tester__cancel">{{ Cancel }}</span>
				<button @click="handleSubmit" :loading="loading" :class="`device-tester__join_session_btn ${isDisabledJoinBtn ? 'device-tester__join_session_btn_disable' : 'device-tester__join_session_btn_active'}` " :disabled="isDisabledJoinBtn">
					<img src="@/assets/icons/check.png" />
					<span>{{ isTeacherSetup ? StartSessionText : JoinSession }}</span>
				</button>
				</Space>
			</Row>
			<Row type="flex" justify="center">
				<span class="device-tester__mess-teacher-error">{{ messageStartClass }}</span>
			</Row>
			</div>
		</div>
		</div>
	</div>
</template>
<style lang="scss" scoped src="./class-setup.scss"></style>
<script lang="ts" src="./class-setup.ts"></script>