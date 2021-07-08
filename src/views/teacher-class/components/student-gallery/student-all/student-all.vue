<template>
   <h2 v-if="!totalOnlineStudents" class="no-students-message">
    No student has joined the class yet
  </h2>
  <div :class="oneAndOneStatus ? 'oneToOne' : lessonPlanCss + ' student-list student-layout-' + studentLayout">
    <StudentCard v-for="student in topStudents" :key="student.id" :scaleOption="scaleVideoOption" :student="student" :setModeOne="true" :focusStudentId="focusedStudent"/>
  </div>
</template>
<style lang="scss" scoped src="./student-all.scss"></style>
<script lang="ts" src="./student-all.ts"></script>
