<template>
  <div :class="['sc-gallery', !isVisible && 'sc-gallery--hide']" v-show="!isOneToOne">
    <div class="sc-gallery__container" v-dragscroll.x>
      <StudentGalleryItem v-for="student in topStudents" :key="student.id" :student="student" :raisedHand="student.raisingHand ?? false" />
    </div>
    <button class="sc-gallery__toggle" @click="toggle"><MatIcon :type="isVisible ? 'expand_more' : 'expand_less'" /></button>
  </div>
</template>

<script lang="ts" src="./student-gallery.ts"></script>
<style lang="scss" scoped src="./student-gallery.scss"></style>
