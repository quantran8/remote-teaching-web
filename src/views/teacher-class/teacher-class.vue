<template>
  <div :class="['tc', isSidebarCollapsed ? 'no-sidebar' : 'has-sidebar', isOneOneMode !== '' ? 'mode-one-one' : '']">
    <Modal v-model:visible="modalVisible" :title="leavePageText" @ok="handleOk" @cancel="handleCancel">
      <div v-if="!isHelper">
        {{ leaveNoticeText }}
        <Checkbox :checked="cbMarkAsCompleteValue" @change="markAsCompleteChanged" class="tc__modal__notice">
          {{ markAsCompleteText }}
        </Checkbox>
      </div>
      <div v-else>{{ helperExitText }}</div>
    </Modal>
    <ChangeLessonUnit ref="changeLessonUnitRef" />
    <div v-show="isShowPreviewCanvas" class="tc__preview-wrapper">
      <div class="preview-header">
        <div class="close-container" @click="hidePreviewModal">
          <img src="@/assets/icons/close.png" class="close-icon" />
        </div>
      </div>
      <div class="preview-body">
        <canvas class="preview-canvas" id="previewCanvas" />
      </div>
    </div>

    <prevent-esc-firefox />
    <teacher-page-header
      class="tc__header"
      v-if="teacher"
      :teacher-name="teacher.name"
      :className="roomInfo?.classInfo?.className"
      @end="onClickEnd"
    ></teacher-page-header>
    <main class="tc__main">
      <div :class="['tc__sidebar', isSidebarCollapsed && 'tc__sidebar--collapsed', showHideLesson && isOneOneMode !== '' && 'tc__sidebar--one-one']" id="tc__sidebar">
        <LessonPlan
          @open-gallery-mode="toggleView"
          @toggle-lesson-mode="toggleLessonSidebar"
          @open-changing-lesson-unit-modal="showChangingLessonUnitModal"
        />
      </div>
      <div class="tc__content">
        <!--      <div v-if="!isGalleryView" class="tc__content__activity-content">-->
        <!--        <ActivityContent @on-click-content-view="onClickContentView" />-->
        <!--      </div>-->
        <div class="tc__content__whiteboard-content">
          <div class="tc__content__teacher" :class="{ 'tc__content__teacher--gallery': isGalleryView }">
            <TeacherCard
              v-if="teacher"
              class="teacher-card"
              :teacher="teacher"
              :isGalleryView="isGalleryView"
              @hide-all="onClickHideAll"
              @mute-all="onClickMuteAll"
              @show-all="onClickShowAll"
              @unmute-all="onClickUnmuteAll"
              @end="onClickEnd"
            />
          </div>
          <WhiteboardPalette
            v-show="!isBlackOutContent"
            :isGalleryView="isGalleryView"
            :image="isLessonPlan ? currentExposureItemMedia?.image : null"
            :id="isLessonPlan ? currentExposureItemMedia?.id : null"
          />
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
      <div :class="['tc__gallery', isSidebarCollapsed && 'no-sidebar']">
        <StudentGallery />
      </div>
    </main>
    <!--    <DesignateTarget v-if="modalDesignateTarget" :editable="allowDesignate"></DesignateTarget>-->
  </div>
</template>
<style lang="scss" scoped src="./teacher-class.scss"></style>
<script lang="ts" src="./teacher-class.ts"></script>
