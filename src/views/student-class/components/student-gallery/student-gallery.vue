<template>
  <div :class="['sc-gallery', !isVisible && 'sc-gallery--hide']" v-show="isDisplay">
    <div class="sc-gallery__container" :id="'student-list'" v-dragscroll.x>
      <div class="participant-videos-wrapper" :id="'participant-videos-wrapper'">
        <canvas v-for="n in maximumGroup" :key="n" :id="`participant-videos-${n}`" />
      </div>
      <StudentGalleryItem v-for="student in topStudents" :key="student.id" :student="student" :raisedHand="student.raisingHand ?? false" />
    </div>
    <button class="sc-gallery__toggle" @click="toggle"><MatIcon :type="isVisible ? 'expand_more' : 'expand_less'" /></button>
  </div>
</template>

<script lang="ts" src="./student-gallery.ts"></script>
<style lang="scss" scoped src="./student-gallery.scss"></style>
