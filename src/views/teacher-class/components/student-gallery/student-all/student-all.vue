<template>
  <div :class="oneAndOneStatus ? 'oneToOne' : 'student-list'" ref="containerRef">
    <StudentCard v-for="student in topStudents" :key="student.id" :student="student" :setModeOne="true" :allowExpend="topStudents.length > 2" />
  </div>
</template>
<style lang="scss" scoped src="./student-all.scss"></style>
<script lang="ts" src="./student-all.ts"></script>
