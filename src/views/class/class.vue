<template>
  <div class="container">
    <div class="content">
      <div class="teacher" :class="{ 'teacher-full': isGalleryView }">
        <TeacherCard
          v-if="teacher"
          class="teacher-card"
          :id="teacher.id"
          :name="teacher.name"
          :audioEnabled="teacher.audioEnabled"
          :videoEnabled="teacher.videoEnabled"
          @hide-all="onClickHideAll"
          @mute-all="onClickMuteAll"
          @show-all="onClickShowAll"
          @unmute-all="onClickUnmuteAll"
          @end="onClickEnd"
        />
      </div>
      <div v-if="!isGalleryView" class="activity-content">
        <ActivityContent />
      </div>
      <div v-if="!isGalleryView" class="audio-bar">
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
    <div v-if="!isGalleryView" class="lesson-plan">
      <LessonPlan />
    </div>
    <div class="gallery">
      <StudentGallery />
    </div>
    <LeaveModal
      v-if="showModal"
      @dismiss="onClickCloseModal"
      @leave="onClickLeave"
    />
    <ErrorModal
      v-if="isClassNotActive"
      @dismiss="onClickCloseError"
      @confirm="onClickLeave"
    />
  </div>
</template>
<style lang="scss" scoped src="./class.scss"></style>
<script lang="ts" src="./class.ts"></script>