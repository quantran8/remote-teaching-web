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
        <h1 class="sc-header__title">Butterfly class</h1>
        <a class="sc-header__exit" href="#">
          <MatIcon type="close" />
          <span>Exit</span>
        </a>
      </div>
    </div>
  </div>
  <div class="sc-body">
    <div class="sc-content">
      <div :id="teacher?.id" class="sc-content__video"></div>
      <div v-if="isGameView" class="sc-unity"></div>
      <div v-else-if="currentExposureItemMedia && isLessonPlan" class="sc-whiteboard"></div>
      <div v-else-if="isDrawMode" class="sc-content"></div>
    </div>
    <StudentGallery :currentStudent="student" :students="students" />
    <div class="sc-action">
      <a href="javascript:void(0)" class="sc-action__item">
        <img src="@/assets/student-class/hand.svg" class="sc-action__icon" />
      </a>
      <a href="javascript:void(0)" class="sc-action__item">
        <img src="@/assets/student-class/speaker.svg" class="sc-action__icon" />
      </a>
      <a href="javascript:void(0)" class="sc-action__item">
        <img src="@/assets/student-class/eye-cut.svg" class="sc-action__icon" />
      </a>
    </div>
  </div>
  <div class="page-container">
    <div class="page-header">
      <div class="media-buttons">
        <BaseButton class="media-button" @click="toggleAudio" draggable="true">
          <BaseIcon :name="audioIcon"></BaseIcon>
        </BaseButton>
        <BaseButton class="media-button" @click="toggleVideo">
          <BaseIcon :name="videoIcon"></BaseIcon>
        </BaseButton>
      </div>

      <div class="current-student">
        <StudentCard
          v-if="student"
          class="student-card"
          :name="student.name"
          :id="student.id"
          :index="student.index"
          :badge="student.badge"
          :audioEnabled="student.audioEnabled"
          :videoEnabled="student.videoEnabled"
          :showBadge="true"
        />
      </div>
      <div class="fill-center">
        <StudentCard
          v-for="student in students.slice(0, 5)"
          :key="student.id"
          class="student-card"
          :name="student.name"
          :id="student.id"
          :index="student.index"
          :badge="student.badge"
          :audioEnabled="student.audioEnabled"
          :videoEnabled="student.videoEnabled"
        />
      </div>
    </div>
    <div class="page-content">
      <div class="controls">
        <div class="raise-question" @click="onClickRaisingHand">
          <img src="@/assets/icons/icon-action-raisehand.svg" alt="" />
        </div>
        <div class="like" @click="onClickLike">
          <img src="@/assets/icons/icon-action-like.svg" alt="" />
        </div>
      </div>
      <div class="teacher-view" v-if="teacher" :class="{ 'teacher-game': isGameView }">
        <div :id="teacher.id" class="teacher-camera"></div>
        <div class="teacher-name">{{ teacher.name }}</div>
      </div>
      <div v-if="isGameView" class="unityWrapper">
        <UnityView
          src="/games/writting_book/Build/UnityLoader.js"
          json="/games/writting_book/Build/Writing_Book_Activity.json"
          class="unityView"
          message-text="Student"
          @on-loader-loaded="onUnityLoaderLoaded"
          @on-progress="onUnityViewLoading"
          @on-loaded="onUnityViewLoaded"
        ></UnityView>
      </div>
      <!-- <ContentView/> -->
      <div class="content-view-container" v-if="currentExposureItemMedia && isLessonPlan && !isGameView">
        <ContentView
          v-if="!isPointerMode && !isDrawMode && !isStickerMode"
          @on-tap="onClickContentView"
          :masked="isBlackOutContent"
          :image="currentExposureItemMedia.image"
          :contentId="currentExposureItemMedia.id"
          :targets="designateTargets"
          :isAssigned="isAssigned"
          :localTargets="localTargets"
        ></ContentView>
        <AnnotationView
          v-if="isPointerMode || isDrawMode || isStickerMode"
          :image="currentExposureItemMedia.image"
        ></AnnotationView>
      </div>
    </div>
    <div class="page-footer">
      <div class="class-action">
        <img v-if="classAction" :src="require(`../../assets/icons/icon-action-${classAction}.svg`)" alt="" />
      </div>
      <div class="fill-center">
        <StudentCard
          v-for="student in students.slice(5)"
          :key="student.id"
          class="student-card"
          :name="student.name"
          :id="student.id"
          :index="student.index"
          :badge="student.badge"
          :audioEnabled="student.audioEnabled"
          :videoEnabled="student.videoEnabled"
        />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-class.scss"></style>
<script lang="ts" src="./student-class.ts"></script>
