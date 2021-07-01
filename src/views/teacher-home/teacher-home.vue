<template>
  <div class="teacher-page" v-if="policy">
    <div class="teacher-title mt-40">
      <h2>Welcome {{ username }}</h2>
      <span class="teacher-title__indicator-out" v-if="classOnline" @click="onClickClass(classOnline, classOnline.groupId)">
        <span class="teacher-title__indicator-in"></span>
      </span>
    </div>
    <div class="teacher-page__school-select">
      <Select
        placeholder="School"
        showSearch
        :optionFilterProp="children"
        :disabled="disabled"
        :loading="loading"
        :value="schools[0]?.id"
        :filterOption="filterSchools"
        @change="onSchoolChange"
      >
        <Option :value="school.id" :key="school.id" v-for="school in schools.values()">{{ school.name }}</Option>
      </Select>
    </div>
    <hr class="mr-10 ml-10" />
    <div class="calendar-container align-right" v-show="hasClassesShowUpSchedule()" @click="onClickCalendar">
      <span>Schedule</span>
      <img class="calendar" src="@/assets/images/calendar.png" />
    </div>
    <div class="group-class-container" v-show="hasClassesShowUp()">
      <div class="loading" v-show="loadingInfo">
        <Spin></Spin>
      </div>
      <div class="loading" v-if="loading">
        <Spin tip="Loading..."></Spin>
      </div>
      <ClassCard
        v-else
        class="card-margin"
        v-for="cl in classesSchedules"
        :key="cl.classId"
        :id="cl.classId"
        :title="cl.className"
        :description="cl.campusName"
        :remoteClassGroups="cl.groups"
        :active="cl.isActive"
        :isTeacher="cl.isTeacher"
        :loadingStart="loadingStartClass"
        @click-to-access="groupId => onClickClass(cl, groupId)"
      />
    </div>
    <Empty v-show="!hasClassesShowUp()" />
    <MicTest
      :is-teacher="true"
      :visible="startPopupVisible"
      :teacherClass="infoStart?.teacherClass"
      :groupId="infoStart?.groupId"
      :unitInfo="unitInfo"
      :messageStartClass="messageStartClass"
      :loading="popUpLoading"
      @on-join-session="onStartClass"
      @on-cancel="onCancelStartClass"
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
      <Button class="btn-cancel-policy" @click="cancelPolicy">Cancel</Button>
      <Button :disabled="!agreePolicy" type="primary" @click="submitPolicy">Submit</Button>
    </Row>
  </Modal>
</template>
<style lang="scss" scoped src="./teacher-home.scss"></style>
<script lang="ts" src="./teacher-home.ts"></script>
