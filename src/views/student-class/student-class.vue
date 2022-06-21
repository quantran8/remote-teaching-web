<template>
  <join-class-loading v-if="joinLoading" />
  <div class="sc" v-else>
    <prevent-esc-firefox />
    <StudentHeader v-if="!showMessage" />
    <div :class="['sc-body', videosFeedVisible && 'has-feed']" v-if="!showMessage">
      <div class="sc-content" ref="contentSectionRef">
        <UnitPlayer v-if="isPlayVideo" :sourceVideo="sourceVideo" />
        <div v-show="teacherIsDisconnected" class="sc-content__top--confused">
          <img :src="require(`@/assets/student-class/bear-confuse.png`)" alt="confused" />
          <div :class="['sc-content__top--confused__clock', isPlayVideo && 'sticky']">
            <div class="sc-content__top--confused__clock--img">
              <Lottie :options="option" />
            </div>
            <div v-if="teacherIsDisconnected" class="sc-content__top--confused__clock--text">
              <span v-if="isSecondPhase">{{ formattedTime.substring(3) }}</span>
              <span v-else>{{ formattedTimeFirstPhase.substring(3) }}</span>
            </div>
          </div>
        </div>
        <div v-show="!teacherIsDisconnected">
          <AnnotationView v-show="!isBlackOutContent && isLessonPlan" :image="isLessonPlan ? currentExposureItemMedia?.image : null" />
        </div>
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
      <div :class="['sc-teacher', !teacher?.videoEnabled && (!isOneToOne || studentIsOneToOne) && 'border-avatar']" ref="videoContainerRef">
        <div v-show="studentIsDisconnected" class="sc-teacher__content">
          <img class="sc-teacher__image" :src="require(`@/assets/student-class/bear-confuse.png`)" alt="confused" />
        </div>
        <div
          v-if="!isUsingAgora"
          :class="[
		  	'sc-teacher__video',
            'animate__animated',
            'animate__zoomIn',
          ]"
		  v-show="teacher?.videoEnabled && !showBearConfused && (!isOneToOne || studentIsOneToOne)"
        >
          <canvas :id="teacher?.id + '__sub'"></canvas>
        </div>

        <div
          v-else
          :class="[
            'sc-teacher__video',
            'animate__animated',
            'animate__zoomIn',
          ]"
		  v-show="teacher?.videoEnabled && !showBearConfused && (!isOneToOne || studentIsOneToOne)"
          :id="teacher?.id"
        ></div>
        <div
          :class="[
            'sc-teacher__avatar-container',
            'animate__animated',
            'animate__zoomIn',
            ((teacher?.videoEnabled && (!isOneToOne || studentIsOneToOne)) || showBearConfused || (isOneToOne && !studentIsOneToOne)) && 'd-none',
          ]"
        >
          <img class="sc-teacher__avatar" :src="avatarTeacher" />
        </div>
        <div class="sc-independent animate__animated animate__zoomIn" v-show="isOneToOne && !studentIsOneToOne">
          <div class="sc-independent__info-container">
            <div class="sc-independent__avatar-container">
              <img class="sc-independent__avatar-container__avatar" :src="avatarTeacher" />
            </div>
            <p class="sc-independent__text-size">{{ teacher?.name }}</p>
          </div>
          <div class="sc-independent__icon-container">
            <img class="sc-independent__icon-container__size-talk" src="@/assets/images/talk.jpeg" />
            <Lottie :options="iconSand" class="sc-independent__size-clock" />
          </div>
          <div class="sc-independent__info-container">
            <div class="sc-independent__avatar-container">
              <img class="sc-independent__avatar-container__avatar" :src="avatarStudentOneToOne" />
            </div>
            <p class="sc-independent__text-size">{{ studentOneName }}</p>
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
    <StudentGallery v-if="!showMessage" :currentStudent="student" :students="students" :isOneToOne="isOneToOne" />
    <div class="sc-message" v-else>
      <p class="message">{{ apiStatus.message }}</p>
      <div @click="goToHomePage" class="btn-homepage">{{ goToHomePageText }}</div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-class.scss"></style>
<script lang="ts" src="./student-class.ts"></script>
