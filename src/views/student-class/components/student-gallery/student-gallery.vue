<template>
  <div class="sc-gallery">
    <StudentGalleryItem v-for="student in topStudents" :key="student.id" :student="student" />
    <StudentGalleryItem v-if="currentStudent" :student="currentStudent" :isCurrent="true" />
  </div>
</template>

<script lang="ts" src="./student-gallery.ts"></script>
<style lang="scss" scoped src="./student-gallery.scss"></style>
