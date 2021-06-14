<template>
  <div class="sc">
    <div class="sc-header">
      <div class="sc-header__left">
        <h2 class="sc-header__trainer">{{ teacher?.name }}</h2>
        <div class="sc-header__icon" ref="classActionImageRef">
          <img v-if="classAction" :src="require(`@/assets/icons/icon-action-${classAction}.png`)" alt="Icon" />
        </div>
      </div>
      <div class="sc-header__right">
        <!-- <div class="try-button" v-if="!studentIsDisconnected" @click="disconnectSignalR">Manual disconnect SIGNALR/AGORA</div> -->
        <h1 class="sc-header__title">{{ classInfo?.name }}</h1>
        <a class="sc-header__exit" @click="onClickEnd">
          <MatIcon type="close" class="red-close" />
          <span>{{ exitText }}</span>
        </a>
      </div>
    </div>
    <div class="sc-body" v-if="!showMessage">
      <div class="sc-content" ref="contentSectionRef">
        <div class="sc-content__top sc-teacher" ref="videoContainerRef">
          <UnitPlayer v-if="isPlayVideo" :sourceVideo="sourceVideo" />
          <div v-show="showBearConfused" class="sc-content__top--confused">
            <img :src="require(`@/assets/student-class/bear-confuse.png`)" alt="confused" />
            <div class="sc-content__top--confused__clock">
              <div class="sc-content__top--confused__clock--img">
                <Lottie :options="option" />
              </div>
              <div v-if="teacherIsDisconnected" class="sc-content__top--confused__clock--text">{{ formattedTime }}</div>
            </div>
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
        <div class="sc-content__bottom" v-show="isLessonPlan">
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
          <div class="sc-lessonplan" v-show="!isBlackOutContent">
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
              :image="isLessonPlan ? (isOneToOne && !studentIsOneToOne ? previousExposureItemMedia?.image : currentExposureItemMedia?.image) : null"
            />
          </div>
          <!-- <div v-show="isDrawMode" class="sc-whiteboard"></div> -->
        </div>
      </div>
      <StudentGallery :currentStudent="student" :students="students" :isOneToOne="isOneToOne" :raisedHand="raisedHand" />
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
    <div class="sc-message" v-else>
      <p class="message">{{ errors.message }}</p>
      <router-link to="/">
        <div class="btn-homepage">{{ goToHomePageText }}</div>
      </router-link>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-class.scss"></style>
<script lang="ts" src="./student-class.ts"></script>
