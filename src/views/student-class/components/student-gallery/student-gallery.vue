<template>
  <div :class="['sc-gallery', !isVisible && 'sc-gallery--hide']" v-show="isDisplay">
    <div class="sc-gallery__container" v-dragscroll.x>
      <div class="participant-videos-wrapper">
        <canvas class="participant-videos" :id="'participant-videos'" :width="topStudents.length * 120 - 30" height="135" />
      </div>
      <StudentGalleryItem v-for="student in topStudents" :key="student.id" :student="student" :raisedHand="student.raisingHand ?? false" />
    </div>
    <button class="sc-gallery__toggle" @click="toggle"><MatIcon :type="isVisible ? 'expand_more' : 'expand_less'" /></button>
  </div>
</template>

<script lang="ts" src="./student-gallery.ts"></script>
<style lang="scss" scoped src="./student-gallery.scss"></style>
