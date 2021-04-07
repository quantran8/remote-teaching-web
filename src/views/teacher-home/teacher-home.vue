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
          :disabled="disabled"
          :loading="loading"
          :value="schools[0]?.id"
          @change="onSchoolChange"
        >
          <Option :value="school.id" :key="school.id" v-for="school in schools">{{ school.name }}</Option>
        </Select>
      </div>
      <div>
        <ClassGroupItem
          v-for="cl in classes"
          :key="cl.schoolClassId"
          :schoolClass="cl"
          :onClickClass="() => onClickClass(cl)"
          :canStartSession="canStartSession"
        />
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped src="./teacher-home.less"></style>
<script lang="ts" src="./teacher-home.ts"></script>