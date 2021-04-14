<template>
  <div class="student-list">
    <StudentCard v-for="student in topStudents" :key="student.id" :student="student" :setModeOne="true" />
  </div>
</template>
<style lang="scss" scoped src="./student-all.scss"></style>
<script lang="ts" src="./student-all.ts"></script>
