<template>
  <div class="sc">
    <prevent-esc-firefox />
    <StudentHeader />
    <div class="sc-body" v-if="!showMessage">
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
          <AnnotationView
            v-show="!isBlackOutContent && isLessonPlan"
            :image="isLessonPlan ? (isOneToOne && !studentIsOneToOne ? previousExposureItemMedia?.image : currentExposureItemMedia?.image) : null"
          />
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
      <div class="sc-teacher" ref="videoContainerRef">
        <div v-show="studentIsDisconnected" class="sc-teacher__content">
          <img class="sc-teacher__image" :src="require(`@/assets/student-class/bear-confuse.png`)" alt="confused" />
        </div>
        <div class="sc-teacher__video" :id="teacher?.id" v-show="!showBearConfused && (!isOneToOne || studentIsOneToOne)"></div>
        <div class="sc-independent" v-show="isOneToOne && !studentIsOneToOne">
          <div class="sc-independent__align-text">
            <div class="sc-independent__avatar-container">
              <img class="sc-independent__avatar-container__avatar" v-if="avatarTeacher && avatarTeacher.length > 0" :src="avatarTeacher" />
              <img class="sc-independent__avatar-container__avatar" v-else src="@/assets/student-class/no-avatar.png" />
            </div>
            <p class="sc-independent__text-size">{{ teacher?.name }}</p>
          </div>
          <div class="sc-independent__icon-container">
            <img class="sc-independent__icon-container__size-talk" src="@/assets/images/talk.jpeg" />
            <Lottie :options="iconSand" :height="60" :width="60" />
          </div>
          <div class="sc-independent__align-text">
            <div class="sc-independent__avatar-container">
              <img
                class="sc-independent__avatar-container__avatar"
                v-if="avatarStudentOneToOne && avatarStudentOneToOne.length > 0"
                :src="`data:image/png;base64,${avatarStudentOneToOne}`"
              />
              <img class="sc-independent__avatar-container__avatar" v-else src="@/assets/student-class/no-avatar.png" />
            </div>
            <p class="sc-independent__text-size">{{ student?.name }}</p>
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
      <p class="message">{{ errors.message }}</p>
      <router-link to="/">
        <div class="btn-homepage">{{ goToHomePageText }}</div>
      </router-link>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-class.scss"></style>
<script lang="ts" src="./student-class.ts"></script>
