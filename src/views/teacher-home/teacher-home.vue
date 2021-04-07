<template>
  <div class="teacher-page">
    <p></p>
    <h2>Welcome {{ username }}</h2>
    <p>Choose a class to start</p>
    <hr />
    <div>
      <div class="teacher-page__school-select">
        <select @change="onSchoolChange($event)">
          <option :value="school.id" :key="school.id" v-for="school in schools">{{ school.name }}</option>
        </select>
      </div>
      <div>
        <ClassGroupItem
          v-for="cl in classes"
          :key="cl.schoolClassId"
          :schoolClass="cl"
          @onClickClass="() => onClickClass(cl)"
        />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./teacher-home.scss"></style>
<script lang="ts" src="./teacher-home.ts"></script>