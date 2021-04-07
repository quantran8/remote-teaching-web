<template>
  <teacher-page-header v-if="teacher" :teacher-name="teacher.name" :className="roomInfo.classInfo.name"   @end="onClickEnd"></teacher-page-header>
  <div class="container">
    <div class="lesson-plan" :class="{'lesson-plan--expanded':!isGalleryView}">
      <LessonPlan @open-gallery-mode="toggleView"/>
    </div>
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
        <ActivityContent @on-click-content-view="onClickContentView" />
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
      <div class="cta-container">
        <div class="cta-button" @mouseover="onHoverCTAButton">
          <img :src="require(`@/assets/icons/icon-action-${classAction.icon}.svg`)" />
          <div
            class="cta-content"
            :class="{ 'cta-content-show': ctaVisible }"
            v-click-outside="onClickOutSideCTAContent"
            @mouseout="onClickOutSideCTAContent"
          >
            <img
              v-for="action of actions"
              :key="action.icon"
              :src="
                require(`../../assets/icons/icon-action-${action.icon}.svg`)
              "
              @click="() => onClickSelectAction(action)"
            />
          </div>
        </div>
        <div v-if="!isGalleryView" class="audio-bar">
          <GlobalAudioBar />
        </div>
      </div>
    </div>
    <div class="gallery">
      <StudentControls
          @hide-all="onClickHideAll"
          @mute-all="onClickMuteAll"
          @show-all="onClickShowAll"
          @unmute-all="onClickUnmuteAll" />
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
    <DesignateTarget
      v-if="modalDesignateTarget"
      :editable="allowDesignate"
    ></DesignateTarget>
  </div>
</template>
<style lang="scss" scoped src="./teacher-class.scss"></style>
<script lang="ts" src="./teacher-class.ts"></script>