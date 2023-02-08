<template>
	<div class="teacher-page" v-if="policy">
	  <div class="teacher-title__wrapper">
		<div class="teacher-title">
		  <h1 class="teacher-title__welcome">{{ welcomeText }} {{ username }}</h1>
		  <span class="teacher-title__indicator-out" v-if="classOnline" @click="rejoinClass(classOnline, classOnline.groupId)">
			<span class="teacher-title__indicator-in"></span>
		  </span>
		</div>
		<span class="date-time">{{ now }}</span>
	  </div>
	  <div class="group-class-container" v-show="hasClassesShowUp">
		<div class="loading" v-show="loading">
		  <Spin class="ant-custom-home"></Spin>
		</div>
		<div v-if="schoolIds.length > 0">
		  <div v-for="schoolId in schoolIds" :key="schoolId">
			<div :class="['group-class-wrapper', isThreeGroup && 'three-group']">
			  <h2 class="school-name">{{ getSchoolNameBySchoolId(schoolId) }}</h2>
			  <div v-for="campusId in getCampusBySchoolId(schoolId)" :key="campusId">
				<h3 class="campus">{{ getCampusNameByCampusId(campusId) }}</h3>
				<div v-for="cl in getDataByCampus(campusId)" :key="cl.classId">
				  <ClassCard
					class="card-margin"
					:key="cl.classId"
					:id="cl.classId"
					:title="cl.className"
					:description="cl.campusName"
					:remoteClassGroups="cl.groups"
					:isTeacher="cl.isTeacher"
					:schoolName="cl.schoolName"
					:schoolId="cl.schoolId"
					:loadingStart="loadingStartClass"
					:unit="cl.unit"
					:lesson="cl.lessonNumber"
					v-if="cl.groups.length"
					@click-to-access="(groupId: string, schoolId: string) => onClickClass(cl, groupId, schoolId)"
				  />
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  </div>
	  <Empty v-show="!hasClassesShowUp" />
	  <DeviceTester
		:unitInfo="unitInfo"
		@on-join-session="onStartClass"
		ref="deviceTesterRef"
		:loading="popUpLoading"
		:messageStartClass="messageStartClass"
		:info-start="infoStart"
	  />
	</div>
	<Modal :visible="visible && !policy" :closable="false" :centered="true" :maskClosable="false" :footer="null">
	  <h3>{{ policyTitleModal }}</h3>
	  <p>{{ readPolicy }}</p>
	  <hr />
	  <div class="policy-content">
		<p>
		  <b>{{ policyTitle }}</b>
		  <br />{{ policySubtitle }}
		</p>
		<p>{{ policyText1 }}</p>
		<p>{{ policyText2 }}</p>
		<p>{{ policyText3 }}</p>
		<p>{{ policyText4 }}</p>
	  </div>
	  <Checkbox @change="onAgreePolicy">{{ acceptPolicyText }}</Checkbox>
	  <Row type="flex" justify="end">
		<Button class="btn-cancel-policy" @click="cancelPolicy">{{ cancelText }}</Button>
		<Button :disabled="!agreePolicy" type="primary" @click="submitPolicy">{{ submitText }}</Button>
	  </Row>
	</Modal>
  </template>
  <style lang="scss" scoped src="./teacher-home.scss"></style>
  <script lang="ts" src="./teacher-home.ts"></script>
  