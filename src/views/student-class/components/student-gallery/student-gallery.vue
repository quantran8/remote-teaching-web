<template>
  <div class="sc-gallery">
    <template v-if="!isOneToOne">
      <StudentGalleryItem v-for="student in topStudents" :key="student.id" :student="student" />
    </template>
    <StudentGalleryItem v-if="currentStudent" :student="currentStudent" :isCurrent="true" :isOneToOne="isOneToOne" />
  </div>
</template>

<script lang="ts" src="./student-gallery.ts"></script>
<style lang="scss" scoped src="./student-gallery.scss"></style>
