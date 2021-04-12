<template>
  <div class="teacher-page">
    <p></p>
    <h2>Welcome {{ username }}</h2>
    <p>Choose a class to start</p>
    <Select
      placeholder="School"
      showSearch
      :disabled="disabled"
      :loading="loading"
      :value="schools[0]?.id"
      :filterOption="false"
      @search="filterSchools"
      @change="onSchoolChange"
    >
      <Option :value="school.id" :key="school.id" v-for="school in filteredSchools">{{ school.name }}</Option>
    </Select>
    <hr />
    <div>
      <ClassCard
        class="card-margin"
        v-for="cl in classes"
        :key="cl.schoolClassId"
        :id="cl.schoolClassId"
        :title="cl.schoolClassName"
        :description="cl.schoolName"
        :active="cl.isActive"
        @click-to-access="() => onClickClass(cl)"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./teacher-home.scss"></style>
<script lang="ts" src="./teacher-home.ts"></script>
