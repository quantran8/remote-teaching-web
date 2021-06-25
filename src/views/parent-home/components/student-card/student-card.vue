<template>
  <BaseCard class="user-container">
    <img class="user-avatar" :src="userAvatar" />
    <div class="user-name">{{ name }}</div>
    <div class="next-session-info-online mt-20" v-if="nextSessionInfo && nextSessionInfo.sessionId">
      Class: {{ nextSessionInfo && nextSessionInfo.classInfo.className }}
      <div class="indicator-container">
        <span class="indicator-container__out">
          <span class="indicator-container__in"></span>
        </span>
      </div>
    </div>
    <div class="next-session-info mt-20" v-else>
      <p class="next-session-info__class">Class: {{ nextSessionInfo && nextSessionInfo.classInfo.className }}</p>
      <p class="next-session-info__time">Next Session: {{ nextSessionInfo && convertDate(nextSessionInfo.nextTime) }}</p>
    </div>
  </BaseCard>
</template>
<style lang="scss" scoped src="./student-card.scss"></style>
<script lang="ts" src="./student-card.ts"></script>
