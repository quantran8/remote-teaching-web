<template>
  <BaseCard class="user-container">
    <img class="user-avatar" :src="userAvatar" />
    <div class="user-name">{{ name }}</div>
    <div class="next-session-info mt-20" v-if="nextSessionInfo">
      <p class="next-session-info__class">
        {{ getInfo(nextSessionInfo) }}
        <span class="indicator-container" v-if="nextSessionInfo && nextSessionInfo.sessionId">
          <span class="indicator-container__out">
            <span class="indicator-container__in"></span>
          </span>
        </span>
      </p>
      <p class="next-session-info__time">{{ nextSessionInfo && convertDate(nextSessionInfo.nextTime) }}</p>
    </div>
  </BaseCard>
</template>
<style lang="scss" scoped src="./student-card.scss"></style>
<script lang="ts" src="./student-card.ts"></script>
