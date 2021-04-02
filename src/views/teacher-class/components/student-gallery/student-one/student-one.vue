<template>
  <div class="container">
    <button class="btn-return" @click="backToClass">Return Class</button>
    <StudentCard
      :key="studentOne.id"
      class="student-card"
      :name="studentOne.name"
      :id="studentOne.id"
      :index="studentOne.index"
      :badge="studentOne.badge"
      :audioEnabled="studentOne.audioEnabled"
      :videoEnabled="studentOne.videoEnabled"
      :status="studentOne.status"
      :raisingHand="studentOne.raisingHand"
      :setModeOne="false"
    />
  </div>
</template>
<style lang="scss" scoped src="./student-one.scss"></style>
<script lang="ts" src="./student-one.ts"></script>
