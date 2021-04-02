<template>
  <div class="container">
    <StudentCard
      v-for="student in students"
      :key="student.id"
      class="student-card"
      :name="student.name"
      :id="student.id"
      :index="student.index"
      :badge="student.badge"
      :audioEnabled="student.audioEnabled"
      :videoEnabled="student.videoEnabled"
      :status="student.status"
      :raisingHand="student.raisingHand"
      :setModeOne="true"
    />
  </div>
</template>
<style lang="scss" scoped src="./student-all.scss"></style>
<script lang="ts" src="./student-all.ts"></script>
