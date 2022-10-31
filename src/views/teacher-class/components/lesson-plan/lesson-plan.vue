<template>
  <div class="lesson-container">
    <div>
      <PinningModal :status="infoPopupStatus" :position="teachingIconPosition" :onPinOrHide="handlePinOrHide">
        <template #final-modal-content>
          <div v-if="currentExposure">
            <div v-if="!hasZeroTeachingContent">
              <div v-for="{ id, textContent } in currentExposure.teachingActivityBlockItems" :key="id" v-html="textContent" />
            </div>
            <div v-if="isTransitionBlock">
              <div v-html="currentExposure.name" />
            </div>
            <div v-if="!isTransitionBlock && hasZeroTeachingContent" style="display: flex; flex-direction: column; align-items: center;">
				<Empty imageStyle="max-height: 45px" :description="''" />
				<div>{{noDataText}}</div>
            </div>
          </div>
        </template>
      </PinningModal>
    </div>
    <div ref="lessonContainerHeaderFixed">
      <div class="lesson-container__header">
        <div
          class="lesson-container__header-title"
          :class="[isGalleryView && 'lesson-container__header-title--text-right', hasLongShortcutHeader && 'long-title']"
        >
          <a :class="['lesson-container__header-title--wrap', isGalleryView && 'shortcut']" @click="onClickUnit">
            <span :class="['lesson-container__header-title--wrap__unit', isGalleryView && 'shortcut', hasLongShortcutHeader && 'long-title']">
              {{ isGalleryView ? `${currentUnit}|` : `${unitText} ${currentUnit}` }}
            </span>
            <span :class="['lesson-container__header-title--wrap__lesson', isGalleryView && 'shortcut', hasLongShortcutHeader && 'long-title']">
              {{ isGalleryView ? currentLesson : `(${lessonText}: ${currentLesson})` }}
            </span>
          </a>
        </div>
        <span
          @click="backToGalleryMode"
          v-if="isOneOneMode === ''"
          :class="['lesson-container__header-back', hasLongShortcutHeader && isGalleryView && 'long-title']"
        >
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
          <div @mouseover="handleMouseOver" class="exposure-info" :class="[infoPopupStatus !== PopupStatus.Pinned && 'cursor-pointer']" id="lp-info">
            <img ref="infoIconRef" class="exposure-info__icon-info" src="@/assets/images/info.png" alt="" />
          </div>
        </div>
      </div>
    </div>
    <div
      ref="lessonContainer"
      id="lesson-container"
      class="lesson-container__body nice-scroll"
      :class="[isGalleryView && 'd-none']"
      :style="{ height: `calc(100% - ${lessonContainerHeaderFixedHeight}px)` }"
    >
      <div class="lesson-container__body--info">
        <div class="progress">
          <div class="indicator" :style="{ transform: `scaleX(${progress})` }"></div>
          <div class="progress__remaining-time">{{ remainingText }} {{ remainingTime }}</div>
        </div>
        <div class="lesson-container__statistic">
          <div class="lesson-container__statistic-info">
            <div>{{ itemText }} {{ activityStatistic }}</div>
            <div>{{ pageText }} {{ page }}</div>
          </div>
          <div class="lesson-container__icon">
            <img class="lesson-container__icon-next margin-left" :src="iconPrev" @click="onClickPrevNextMedia(PREV_EXPOSURE)" alt="" />
            <img class="lesson-container__icon-next margin-left" :src="iconNext" @click="onClickPrevNextMedia(NEXT_EXPOSURE)" alt="" />
          </div>
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
