<template>
  <div class="teacher-page" v-if="policy">
    <div class="teacher-title mt-40">
      <h2>Welcome {{ username }}</h2>
      <span class="teacher-title__indicator-out" v-if="haveClassActive" @click="onClickClass(classActive)">
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
    <div class="calendar-container align-right">
      <span>Schedule</span>
      <img class="calendar" src="@/assets/images/calendar.png" />
    </div>
    <div class="group-class-container">
      <div class="loading" v-if="loading">
        <Spin tip="Loading..."></Spin>
      </div>
      <ClassCard
        v-else
        class="card-margin"
        v-for="cl in classes"
        :key="cl.schoolClassId"
        :id="cl.schoolClassId"
        :title="cl.schoolClassName"
        :description="cl.campusName"
        :remoteClassGroups="cl.remoteClassGroups"
        :active="cl.isActive"
        @click-to-access="() => onClickClass(cl)"
      />
    </div>
  </div>
  <h1 class="access-denied" v-if="!visible && !policy">Access Denied</h1>
  <Modal :visible="visible && !policy" title="Privacy Policy" :closable="false" :centered="true" :maskClosable="false" :footer="null">
    <div class="policy-content">
      <p>{{ policyText1 }}</p>
      <p>{{ policyText2 }}</p>
      <p>{{ policyText3 }}</p>
      <p>{{ policyText4 }}</p>
      <Checkbox @change="onAgreePolicy">I accept the policies</Checkbox>
    </div>
    <Row type="flex" justify="end">
      <Button class="btn-cancel-policy" @click="cancelPolicy">Cancel</Button>
      <Button :disabled="!agreePolicy" type="primary" @click="submitPolicy">Submit</Button>
    </Row>
  </Modal>
</template>
<style lang="scss" scoped src="./teacher-home.scss"></style>
<script lang="ts" src="./teacher-home.ts"></script>
