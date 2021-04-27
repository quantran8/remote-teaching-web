<template>
  <div class="sc">
    <div class="sc-header">
      <div class="sc-header__left">
        <h2 :class="[!(currentExposureItemMedia && isLessonPlan) ? 'sc-header__trainer' : 'sc-header__trainer--mini']">{{ teacher?.name }}</h2>
        <div class="sc-header__icon" ref="classActionImageRef">
          <img v-if="classAction" :src="require(`@/assets/icons/icon-action-${classAction}.png`)" alt="Icon" />
        </div>
      </div>
      <div class="sc-header__right">
        <h1 class="sc-header__title">{{ classInfo?.name }}</h1>
        <a class="sc-header__exit" @click="onClickEnd">
          <MatIcon type="close" class="red-close" />
          <span>Exit</span>
        </a>
      </div>
    </div>
    <div :class="!(currentExposureItemMedia && isLessonPlan) ? 'sc-body' : 'sc-body--mini'">
      <div class="sc-content" ref="contentSectionRef">
        <div :class="!(currentExposureItemMedia && isLessonPlan) ? 'sc-content__top sc-teacher' : 'sc-content__top sc-teacher--mini'" ref="videoContainerRef">
          <div :class="!(currentExposureItemMedia && isLessonPlan) ? 'sc-teacher__video' : 'sc-teacher--mini__video'" :id="teacher?.id" v-show="!isOneToOne || studentIsOneToOne"></div>
          <div class="sc-teacher__video" v-show="isOneToOne && !studentIsOneToOne">
            <img class="sc-teacher__one-to-one" src="@/assets/images/talk.png" />
          </div>
        </div>
        <div class="sc-content__bottom" v-if="currentExposureItemMedia && isLessonPlan">
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
          <div class="sc-lessonplan">
            <!--            <ContentView-->
            <!--              v-if="!isPointerMode && !isDrawMode && !isStickerMode"-->
            <!--              @on-tap="onClickContentView"-->
            <!--              :masked="isBlackOutContent"-->
            <!--              :image="currentExposureItemMedia?.image"-->
            <!--              :contentId="currentExposureItemMedia?.id"-->
            <!--              :targets="designateTargets"-->
            <!--              :isAssigned="isAssigned"-->
            <!--              :localTargets="localTargets"-->
            <!--              :studentOneId="studentOneAndOneId"-->
            <!--            ></ContentView>-->
            <AnnotationView
              v-if="!isBlackOutContent"
              :image="isLessonPlan ? (isOneToOne && !studentIsOneToOne ? previousImage : currentExposureItemMedia?.image) : null"
            />
          </div>
          <!-- <div v-show="isDrawMode" class="sc-whiteboard"></div> -->
        </div>
      </div>
      <!-- <div> -->
      <StudentGallery :currentStudent="student" :students="students" :isOneToOne="isOneToOne" :raisedHand="raisedHand" />
      <div class="sc-action">
        <a href="javascript:void(0)" class="sc-action__item" @click="onClickRaisingHand">
          <img :src="handIcon" class="sc-action__icon sc-action__icon--hand" />
        </a>
        <a href="javascript:void(0)" class="sc-action__item" @click="toggleAudio">
          <img :src="audioIcon" class="sc-action__icon" />
        </a>
        <a href="javascript:void(0)" class="sc-action__item" @click="toggleVideo">
          <img :src="videoIcon" class="sc-action__icon" />
        </a>
        <!-- </div> -->
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-class.scss"></style>
<script lang="ts" src="./student-class.ts"></script>
