<template>
  <div class="container">
    <div class="content">
      <div class="teacher" :class="{ 'teacher-full': !isGalleryView }">
        <TeacherCard
          class="teacher-card"
          :id="teacher.id"
          :name="teacher.name"
          :audioEnabled="teacher.audioEnabled"
          :videoEnabled="teacher.videoEnabled"
        />
      </div>
      <div v-if="isGalleryView" class="activity-content">
        <ActivityContent />
      </div>
      <div v-if="isGalleryView" class="audio-bar">
        <GlobalAudioBar />
      </div>
      <div class="view-controls">
        <div
          v-for="item in views"
          class="view-item"
          :class="{ 'item-active': currentView === item.id }"
          :key="item.name"
          @click="() => setClassView(item.id)"
        >
          <div class="icon"></div>
          <div class="item-name">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <div v-if="isGalleryView" class="lesson-plan">
      <LessonPlan />
    </div>
    <div class="gallery" :class="{ 'gallery-lg': !isGalleryView }">
      <StudentGallery />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./class.scss"></style>
<script lang="ts" src="./class.ts"></script>