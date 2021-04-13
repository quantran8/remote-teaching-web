<template>
  <div class="teacher-page">
    <p></p>
    <h2>Welcome {{ username }}</h2>
    <p>Choose a class to start</p>
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
    <hr />
    <div>
      <ClassCard
        class="card-margin"
        v-for="cl in classes"
        :key="cl.schoolClassId"
        :id="cl.schoolClassId"
        :title="cl.schoolClassName"
        :description="cl.campusName"
        :active="cl.isActive"
        @click-to-access="() => onClickClass(cl)"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./teacher-home.scss"></style>
<script lang="ts" src="./teacher-home.ts"></script>
