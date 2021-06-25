<template>
  <BaseCard class="user-container">
    <img class="user-avatar" :src="userAvatar" />
    <div class="user-name">{{ name }}</div>
    <div class="next-session-info mt-20" v-if="nextSessionInfo && nextSessionInfo.sessionId">
      <p class="next-session-info__class">{{ classText }}{{ nextSessionInfo && nextSessionInfo.classInfo.className }}</p>
      <p class="next-session-info__group">{{ groupText }}{{ nextSessionInfo && nextSessionInfo.classInfo.groupName }}</p>
      <div class="indicator-container">
        <span class="indicator-container__out">
          <span class="indicator-container__in"></span>
        </span>
      </div>
    </div>
    <div class="next-session-info mt-20" v-else>
      <p class="next-session-info__class">{{ classText }}{{ nextSessionInfo && nextSessionInfo.classInfo.className }}</p>
      <p class="next-session-info__class">{{ groupText }}{{ nextSessionInfo && nextSessionInfo.classInfo.groupName }}</p>
      <p class="next-session-info__time">{{ nextSessionText }}{{ nextSessionInfo && convertDate(nextSessionInfo.nextTime) }}</p>
    </div>
  </BaseCard>
</template>
<style lang="scss" scoped src="./student-card.scss"></style>
<script lang="ts" src="./student-card.ts"></script>
