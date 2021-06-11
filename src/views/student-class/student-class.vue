<template>
  <div class="sc">
    <StudentHeader />
    <div class="sc-body">
      <div class="sc-content" ref="contentSectionRef">
        <AnnotationView
          v-show="!isBlackOutContent && isLessonPlan"
          :image="isLessonPlan ? (isOneToOne && !studentIsOneToOne ? previousExposureItemMedia?.image : currentExposureItemMedia?.image) : null"
        />
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
        <!-- <div v-show="isDrawMode" class="sc-whiteboard"></div> -->
      </div>
      <div class="sc-teacher" ref="videoContainerRef">
        <div v-show="showBearConfused" class="sc-content__top--confused">
          <img :src="require(`@/assets/student-class/bear-confuse.png`)" alt="confused" />
          <span v-if="teacherIsDisconnected" class="sc-content__top--confused__time">{{ formattedTime }}</span>
        </div>
        <div class="sc-teacher__video" :id="teacher?.id" v-show="!showBearConfused && (!isOneToOne || studentIsOneToOne)"></div>
        <div class="sc-teacher__video" v-show="isOneToOne && !studentIsOneToOne">
          <img class="sc-teacher__one-to-one" src="@/assets/images/talk.png" />
        </div>
      </div>
      <div class="sc-student">
        <StudentGalleryItem class="sc-student__avatar" :student="student" :isCurrent="true" :isOneToOne="isOneToOne" :raisedHand="raisedHand" />
        <div class="sc-action">
          <a href="javascript:void(0)" class="sc-action__item" @click="onClickRaisingHand">
            <img v-show="raisedHand" :src="IconHandRaised" class="sc-action__icon sc-action__icon--hand" />
            <img v-show="!raisedHand" :src="IconHand" class="sc-action__icon sc-action__icon--hand" />
          </a>
          <a href="javascript:void(0)" class="sc-action__item" @click="toggleAudio">
            <img v-show="student?.audioEnabled" :src="IconAudioOn" class="sc-action__icon" />
            <img v-show="!student?.audioEnabled" :src="IconAudioOff" class="sc-action__icon" />
          </a>
          <a href="javascript:void(0)" class="sc-action__item" @click="toggleVideo">
            <img v-show="student?.videoEnabled" :src="IconVideoOn" class="sc-action__icon" />
            <img v-show="!student?.videoEnabled" :src="IconVideoOff" class="sc-action__icon" />
          </a>
        </div>
      </div>
    </div>
    <StudentGallery :currentStudent="student" :students="students" :isOneToOne="isOneToOne" />
  </div>
</template>
<style lang="scss" scoped src="./student-class.scss"></style>
<script lang="ts" src="./student-class.ts"></script>
