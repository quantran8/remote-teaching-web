<template>
  <div>
    <div class="container">
      <StudentCard
        v-for="student in studentViewModels"
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
        :interactive="student.interactive"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-gallery.scss"></style>
<script lang="ts" src="./student-gallery.ts"></script>
