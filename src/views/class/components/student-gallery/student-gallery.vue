<template>
  <div>
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
      />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-gallery.scss"></style>
<script lang="ts" src="./student-gallery.ts"></script>