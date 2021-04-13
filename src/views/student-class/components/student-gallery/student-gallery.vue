<template>
  <div class="sc-gallery">
    <template v-if="!isOneToOne">
      <transition-group name="list" tag="div" @enter="onEnter" @leave="onLeave" :css="false">
        <div class="sc-gallery__item" v-for="student in topStudents" :key="student.id">
          <StudentGalleryItem :student="student" />
        </div>
      </transition-group>
    </template>
    <StudentGalleryItem v-if="currentStudent" :student="currentStudent" :isCurrent="true" :isOneToOne="isOneToOne" :raisedHand="raisedHand" />
  </div>
</template>

<script lang="ts" src="./student-gallery.ts"></script>
<style lang="scss" scoped src="./student-gallery.scss"></style>
