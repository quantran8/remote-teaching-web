<template>
  <div class="teacher-page">
    <p></p>
    <h2>Welcome {{ username }}</h2>
    <p>Choose a class to start</p>
    <hr />
    <div>
      <div class="teacher-page__school-select">
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
      </div>
      <div class="teacher-page__classgroup">
        <ClassGroupItem
          v-for="cl in classes"
          :key="cl.schoolClassId"
          :schoolClass="cl"
          :onClickClass="(cls) => onClickClass(cls)"
          :onClickGroup="(classId) => onClickGroup(classId)"
          :canStartSession="canStartSession"
        />
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped src="./teacher-home.less"></style>
<script lang="ts" src="./teacher-home.ts"></script>