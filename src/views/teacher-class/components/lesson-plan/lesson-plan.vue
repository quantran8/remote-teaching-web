<template>
  <div class="lesson-container">
    <div class="lesson-container__header">
      <div class="lesson-container__header-title" :class="[isGalleryView && 'lesson-container__header-title--text-right']">
        <span :class="['lesson-container__header-title--wrap', isGalleryView && 'shortcut']">
          <span>
            <span :class="['lesson-container__header-title--wrap__unit', isGalleryView && 'shortcut']">
              {{ isGalleryView ? `${currentUnit}:` : `${unitText} ${currentUnit}` }}
            </span>
            <span :class="['lesson-container__header-title--wrap__lesson', isGalleryView && 'shortcut']">
              {{ isGalleryView ? currentLesson : `(${lessonText}: ${currentLesson})` }}
            </span>
          </span>
        </span>
      </div>
      <span @click="backToGalleryMode" v-if="isOneOneMode === ''" class="lesson-container__header-back">
        <span v-if="isGalleryView">&#8250;</span>
        <span v-else>&#8249;</span>
      </span>
      <span @click="showHideLessonOneOne(showHideLesson)" v-if="isOneOneMode !== '' && !isGalleryView" class="lesson-container__header-back">
        <span v-if="!showHideLesson">&#8250;</span>
        <span v-else>&#8249;</span>
      </span>
    </div>
    <div :class="[isGalleryView && 'd-none']">
      <div class="lesson-container__component-header" v-if="isShowExposureDetail">
        <BaseButton mode="clear" class="icon" @click="onClickCloseExposure">
          <BaseIcon name="icon-back"></BaseIcon>
        </BaseButton>
        <div class="exposure-title">{{ exposureTitle }}</div>
        <div class="exposure-info">
          <img
            class="exposure-info__icon-info"
            src="@/assets/images/info.png"
            @mouseover="toggleInformationBox"
            @mouseout="toggleInformationBox"
            alt=""
          />
        </div>
      </div>
    </div>
    <div ref="lessonContainer" id="lesson-container" class="lesson-container__body nice-scroll" :class="[isGalleryView && 'd-none']">
      <div class="lesson-container__body--info">
        <div id="lesson-container__remaining-time">
          <p>{{ remainingText }} {{ remainingTime }}</p>
          <p>
            {{ itemText }} {{ activityStatistic }} <br />
            {{ pageText }} {{ page }}
          </p>
          <img class="lesson-container__icon-next" :src="iconNext" @click="onClickPrevNextMedia(NEXT_EXPOSURE)" alt="" />
        </div>
        <div class="progress">
          <div class="indicator" :style="{ transform: `scaleX(${progress})` }"></div>
        </div>
      </div>
      <div class="activities">
        <div v-if="isShowExposureDetail">
          <ExposureDetail
            :type="exposureTypes.TRANSITION_BLOCK"
            v-if="isTransitionType"
            :exposure="currentExposure"
            @click-back="onClickCloseExposure"
          />
          <ExposureDetail
            :type="exposureTypes.LP_COMPLETE_BLOCK"
            v-if="isCompleteType"
            :exposure="currentExposure"
            @click-back="onClickCloseExposure"
          />
          <ExposureDetail
            :type="exposureTypes.VCP_BLOCK"
            v-if="!isTransitionType && !isCompleteType"
            :exposure="currentExposure"
            @click-back="onClickCloseExposure"
          />
          <ExposureDetail
            :type="exposureTypes.CONTENT_BLOCK"
            v-if="!isTransitionType && !isCompleteType"
            :exposure="currentExposure"
            @click-back="onClickCloseExposure"
          />
          <ExposureDetail
            :type="exposureTypes.TEACHING_ACTIVITY_BLOCK"
            v-if="!isTransitionType && !isCompleteType"
            :exposure="currentExposure"
            @click-back="onClickCloseExposure"
          />
        </div>
        <div v-else>
          <LessonActivity
            class="lesson-activity"
            v-for="exposure in exposures"
            :key="exposure.id"
            :id="exposure.id"
            :title="exposure.name"
            :type="exposure.type"
            :duration="exposure.duration"
            :status="exposure.status"
            @click="() => onClickExposure(exposure)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./lesson-plan.scss"></style>
<script lang="ts" src="./lesson-plan.ts"></script>
