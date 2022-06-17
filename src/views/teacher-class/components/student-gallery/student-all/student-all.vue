<template>
  <h2 v-if="!totalOnlineStudents" class="no-students-message">
    {{ noStudentJoinText }}
  </h2>
  <div :id="'student-list'" :class="oneAndOneStatus ? 'oneToOne' : lessonPlanCss + ' student-list student-layout-' + studentLayout">
    <StudentCard
      v-for="student in topStudents"
      :key="student.id"
      :scaleOption="scaleVideoOption"
      :student="student"
      :setModeOne="true"
      :focusStudentId="focusedStudent"
    />

    <canvas v-show="!oneAndOneStatus && totalOnlineStudents" class="participant-videos" :id="'participant-videos'" width="700" height="1080"/>
  </div>

</template>
<style lang="scss" scoped src="./student-all.scss"></style>
<script lang="ts" src="./student-all.ts"></script>
