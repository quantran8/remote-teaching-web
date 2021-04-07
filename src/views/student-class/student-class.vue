<template>
  <div class="sc">
    <div class="sc-header">
      <div class="sc-header__left">
        <h2 class="sc-header__trainer">{{ teacher?.name }}</h2>
        <div>
          <img class="sc-header__icon" src="@/assets/student-class/class-icon.svg" alt="Icon" />
        </div>
      </div>
      <div class="sc-header__right">
        <h1 class="sc-header__title">{{ classInfo?.name }}</h1>
        <router-link class="sc-header__exit" :to="$paths.Parent">
          <MatIcon type="close" />
          <span>Exit</span>
        </router-link>
      </div>
    </div>
  </div>
  <div class="sc-body">
    <div class="sc-content" ref="contentSectionRef">
      <div class="sc-content__top sc-teacher" ref="videoContainerRef">
        <div :id="teacher?.id" :class="studentIsOneToOne ? 'sc-teacher__video sc-teacher__visible' : 'sc-teacher__not-visible'"></div>
		<div :class="!studentIsOneToOne ? 'sc-teacher__video sc-teacher__visible' : 'sc-teacher__not-visible'">
			<img class="sc-teacher__one-to-one" src="@/assets/images/talk.png" />
		</div>
      </div>
      <div class="sc-content__bottom">
        <!-- <div v-show="isGameView" class="sc-unity">
          <UnityView
            v-if="isGameView"
            src="/games/writting_book/Build/UnityLoader.js"
            json="/games/writting_book/Build/Writing_Book_Activity.json"
            class="unityView"
            message-text="Student"
            @on-loader-loaded="onUnityLoaderLoaded"
            @on-progress="onUnityViewLoading"
            @on-loaded="onUnityViewLoaded"
          ></UnityView>
        </div> -->
        <div v-show="currentExposureItemMedia && isLessonPlan" class="sc-lessonplan">
          <ContentView
            v-if="!isPointerMode && !isDrawMode && !isStickerMode"
            @on-tap="onClickContentView"
            :masked="isBlackOutContent"
            :image="currentExposureItemMedia?.image"
            :contentId="currentExposureItemMedia?.id"
            :targets="designateTargets"
            :isAssigned="isAssigned"
            :localTargets="localTargets"
          ></ContentView>
          <AnnotationView
            v-if="isPointerMode || isDrawMode || isStickerMode"
            :image="currentExposureItemMedia?.image"
          ></AnnotationView>
        </div>
        <!-- <div v-show="isDrawMode" class="sc-whiteboard"></div> -->
      </div>
    </div>
    <StudentGallery :currentStudent="student" :students="students" :isOneToOne="isOneToOne" />
    <div class="sc-action">
      <a href="javascript:void(0)" class="sc-action__item" @click="onClickRaisingHand">
        <img src="@/assets/student-class/hand.svg" class="sc-action__icon" />
      </a>
      <a href="javascript:void(0)" class="sc-action__item" @click="toggleAudio">
        <img src="@/assets/student-class/speaker.svg" class="sc-action__icon" />
      </a>
      <a href="javascript:void(0)" class="sc-action__item" @click="toggleVideo">
        <img src="@/assets/student-class/eye-cut.svg" class="sc-action__icon" />
      </a>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-class.scss"></style>
<script lang="ts" src="./student-class.ts"></script>
