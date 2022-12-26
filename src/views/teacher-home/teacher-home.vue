<template>
  <div class="teacher-page" v-if="policy">
    <div class="teacher-title__wrapper">
      <div class="teacher-title">
        <h1 class="welcome-text">{{ welcomeText }} {{ username }}</h1>
        <span class="teacher-title__indicator-out" v-if="classOnline" @click="rejoinClass(classOnline, classOnline.groupId)">
          <span class="teacher-title__indicator-in"></span>
        </span>
      </div>
      <span class="date-time">{{ now }}</span>
    </div>
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
      <div class="loading" v-show="loadingInfo">
        <Spin class="ant-custom-home"></Spin>
      </div>
      <div v-if="classesSchedulesAllSchool">
        <div class="loading" v-if="loading">
          <Spin tip="Loading..." class="ant-custom-home"></Spin>
        </div>
        <div :key="item[0].classId" v-for="item in classesSchedulesAllSchool">
          <div class="school-name">
            <h2>{{ item[0].schoolName }}</h2>
          </div>
          <h3 class="campus">{{ item[0].campusName }}</h3>
          <ClassCard
            v-for="cl in item"
            class="card-margin"
            :key="cl.classId"
            :id="cl.classId"
            :title="cl.className"
            :description="cl.campusName"
            :remoteClassGroups="cl.groups"
            :active="cl.isActive"
            :isTeacher="cl.isTeacher"
            :schoolName="cl.schoolName"
            :schoolId="cl.schoolId"
            :loadingStart="loadingStartClass"
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
