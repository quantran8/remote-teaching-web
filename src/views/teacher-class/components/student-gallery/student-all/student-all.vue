<template>
  <div :class="oneAndOneStatus ? 'oneToOne' : 'student-list student-list-'+studentLayout">
    <StudentCard v-for="student in topStudents" :key="student.id" :student="student" :setModeOne="true" :focusStudentId="focusedStudent"/>
  </div>
</template>
<style lang="scss" scoped src="./student-all.scss"></style>
<script lang="ts" src="./student-all.ts"></script>
