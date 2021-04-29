<template>
  <div class="tc">
    <teacher-page-header
      class="tc__header"
      v-if="teacher"
      :teacher-name="teacher.name"
      :className="roomInfo.classInfo.name"
      @end="onClickEnd"
    ></teacher-page-header>
    <div :class="['tc__sidebar', isSidebarCollapsed && 'tc__sidebar--collapsed']">
      <LessonPlan @open-gallery-mode="toggleView" />
    </div>
    <div class="tc__content" :style="{ paddingTop: !isLessonPlan ? '200px' : '0px' }">
      <div class="tc__content__teacher" :class="{ 'tc__content__teacher--gallery': isGalleryView }">
        <TeacherCard
          v-if="teacher"
          class="teacher-card"
          :id="teacher.id"
          :name="teacher.name"
          :audioEnabled="teacher.audioEnabled"
          :videoEnabled="teacher.videoEnabled"
          :isGalleryView="isGalleryView"
          @hide-all="onClickHideAll"
          @mute-all="onClickMuteAll"
          @show-all="onClickShowAll"
          @unmute-all="onClickUnmuteAll"
          @end="onClickEnd"
        />
      </div>
      <!--      <div v-if="!isGalleryView" class="tc__content__activity-content">-->
      <!--        <ActivityContent @on-click-content-view="onClickContentView" />-->
      <!--      </div>-->
      <div v-show="isLessonPlan" class="tc__content__whiteboard-content">
        <WhiteboardPalette v-show="!isBlackOutContent" :image="isLessonPlan ? currentExposureItemMedia?.image : null" />
      </div>
      <!--      <div v-if="!isGalleryView && isGameView" class="unityWrapper">-->
      <!--        <UnityView-->
      <!--          src="/games/writting_book/Build/UnityLoader.js"-->
      <!--          json="/games/writting_book/Build/Writing_Book_Activity.json"-->
      <!--          class="unityView"-->
      <!--          message-text="Teacher"-->
      <!--          @on-loader-loaded="onUnityLoaderLoaded"-->
      <!--          @on-progress="onUnityViewLoading"-->
      <!--          @on-loaded="onUnityViewLoaded"-->
      <!--        ></UnityView>-->
      <!--      </div>-->

      <!--        <div v-if="!isGalleryView" class="audio-bar">-->
      <!--          <GlobalAudioBar />-->
      <!--        </div>-->
    </div>
    <div class="tc__gallery">
      <StudentGallery />
    </div>
    <ErrorModal v-if="isClassNotActive" @dismiss="onClickCloseError" @confirm="onClickLeave" />
    <!--    <DesignateTarget v-if="modalDesignateTarget" :editable="allowDesignate"></DesignateTarget>-->
  </div>
</template>
<style lang="scss" scoped src="./teacher-class.scss"></style>
<script lang="ts" src="./teacher-class.ts"></script>
