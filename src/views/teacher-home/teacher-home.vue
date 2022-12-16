<template>
  <div class="teacher-page" v-if="policy">
    <div class="teacher-title m-20">
      <h1>{{ welcomeText }} {{ username }}</h1>
      <span class="date-time">{{ now }}</span>
      <span class="teacher-title__indicator-out" v-if="classOnline" @click="onClickClass(classOnline, classOnline.groupId)">
        <span class="teacher-title__indicator-in"></span>
      </span>
    </div>
    <!-- <div class="teacher-page__school-select">
	      <Select
	        placeholder="School"
	        showSearch
	        optionLabelProp="children"
	        :disabled="disabled"
	        :loading="loading"
	        :value="schools[0]?.id"
	        :filterOption="filterSchools"
	        @change="onSchoolChange"
	      >
	        <Option :value="school.id" :key="school.id" v-for="school in schools.values()">{{ school.name }}</Option>
	      </Select>
	    </div> -->
    <!-- <hr class="mr-10 ml-10" /> -->
    <div class="menu-container">
      <div class="icon-container" v-show="hasClassesShowUpSchedule()" @click="onClickHome">
        <img class="calendar" src="@/assets/images/teacher-pointing-blackboard.png" />
        <span>Home</span>
      </div>
      <div class="icon-container calendar-container" v-show="hasClassesShowUpSchedule()" @click="onClickCalendar">
        <img class="calendar" src="@/assets/images/calendar11.png" />
        <span>{{ scheduleText }}</span>
      </div>
      <div class="icon-container gallery-container" v-show="hasClassesShowUpSchedule()">
        <img class="calendar" src="@/assets/images/gallery.png" />
        <span>Gallery</span>
      </div>
    </div>
    <div class="group-class-container" v-show="hasClassesShowUp()">
      <!-- <div class="loading" v-show="loadingInfo">
	        <Spin class="ant-custom-home"></Spin>
	      </div> -->
      <div v-if="classesSchedulesAllSchool">
		<div class="loading" v-if="loading">
            <Spin tip="Loading..." class="ant-custom-home"></Spin>
          </div>
        <div :key="item.classId" v-for="(item, index) in classesSchedulesAllSchool">
          <ClassCard
            class="card-margin"
            v-for="cl in item"
            :key="cl.classId"
            :id="cl.classId"
            :title="cl.className"
            :description="cl.campusName"
            :remoteClassGroups="cl.groups"
            :active="cl.isActive"
            :isTeacher="cl.isTeacher"
            :loadingStart="loadingStartClass"
            :school="schools[index]"
            :unit="cl.unit"
            :lesson="cl.lessonNumber"
            @click-to-access="(groupId, schoolId) => onClickClass(cl, groupId, schoolId)"
          />
        </div>
      </div>
    </div>
    <Empty v-show="!hasClassesShowUp()" />
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
