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
        <div class="sc-independent" v-show="isOneToOne && !studentIsOneToOne">
          <div class="sc-independent__avatar-container">
            <img class="sc-independent__avatar-container__avatar" v-if="avatarTeacher && avatarTeacher.length > 0" :src="avatarTeacher" />
            <img class="sc-independent__avatar-container__avatar" v-else src="@/assets/student-class/no-avatar.png" />
          </div>
          <div class="sc-independent__icon-container">
            <img class="sc-independent__icon-container__size-talk" src="@/assets/images/talk.jpeg" />
            <img class="sc-independent__icon-container__size-clock" src="@/assets/images/sand-clock.png" />
          </div>
          <div class="sc-independent__avatar-container">
            <img
              class="sc-independent__avatar-container__avatar"
              v-if="avatarStudentOneToOne && avatarStudentOneToOne.length > 0"
              :src="`data:image/png;base64,${avatarStudentOneToOne}`"
            />
            <img class="sc-independent__avatar-container__avatar" v-else src="@/assets/student-class/no-avatar.png" />
          </div>
        </div>
      </div>
      <div class="sc-student">
        <StudentGalleryItem
          v-if="student"
          class="sc-student__avatar"
          :student="student"
          :isCurrent="true"
          :isOneToOne="isOneToOne"
          :raisedHand="raisedHand"
        />
        <StudentAction />
      </div>
    </div>
    <StudentGallery :currentStudent="student" :students="students" :isOneToOne="isOneToOne" />
  </div>
</template>
<style lang="scss" scoped src="./student-class.scss"></style>
<script lang="ts" src="./student-class.ts"></script>
