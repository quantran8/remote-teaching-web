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
	<div class="participant-videos-wrapper" :id="'participant-videos-wrapper'" v-show="!oneAndOneStatus && totalOnlineStudents">
      <canvas v-for="n in maximumGroup" :key="n" :id="`participant-videos-${n}`" />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-all.scss"></style>
<script lang="ts" src="./student-all.ts"></script>
