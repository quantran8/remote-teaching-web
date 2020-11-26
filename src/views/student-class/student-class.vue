<template>
  <div class="page-container">
    <h3>Student Class</h3>

    <div id="userStreamID"></div>
    <div class="studentsContainer">
      <StudentCard
        v-for="student in students"
        :key="student.id"
        class="student-card"
        :class="{ 'item-active': student.index == 6 }"
        :name="student.name"
        :id="student.id"
        :index="student.index"
        :badge="student.badge"
        :audioEnabled="student.audioEnabled"
        :videoEnabled="student.videoEnabled"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-class.scss"></style>
<script lang="ts" src="./student-class.ts"></script>