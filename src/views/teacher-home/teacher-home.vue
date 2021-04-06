<template>
  <div class="teacher-page">
    <p></p>
    <h2>Welcome {{ username }}</h2>
    <p>Choose a class to start</p>
    <hr />
    <div>
      <div class="teacher-page__school-select">
        <select>
          <!-- <option @change="" :key="school.id" v-for="school in schools">{{ school }}</option> -->
        </select>
      </div>
      <div>
        <ClassCard
          class="card-margin"
          v-for="cl in classes"
          :key="cl.schoolClassId"
          :id="cl.schoolClassId"
          :title="cl.schoolClassName"
          :description="cl.schoolName"
          :active="cl.isActive"
          @click="() => onClickClass(cl)"
        />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./teacher-home.scss"></style>
<script lang="ts" src="./teacher-home.ts"></script>