<template>
  <h2 v-if="!totalOnlineStudents" class="no-students-message">
    {{ noStudentJoinText }}
  </h2>
  <div ref="studentGallery" :id="'student-list'" :class="[oneAndOneStatus ? 'oneToOne' : '', studentLayout, 'student-list']">
    <StudentCard
      v-for="student in topStudents"
      :key="student.id"
      :scaleOption="scaleVideoOption"
      :student="student"
      :setModeOne="true"
      :focusStudentId="focusedStudent"
    />
    <div class="participant-videos-wrapper" :id="'participant-videos-wrapper'" v-show="!oneAndOneStatus && totalOnlineStudents">
      <canvas id="participant-videos-zoom" />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-all.scss"></style>
<script lang="ts" src="./student-all.ts"></script>
