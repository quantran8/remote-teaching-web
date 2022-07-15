<template>
  <teleport to="body" v-for="notification in notifications" :key="notification.id">
    <div class="notification" :style="notification.style">
      <div class="notification-content">
        <div class="notification-message">{{ notification.message }}</div>
        <BaseIcon name="icon-close" class="close-icon" @click="() => onClickRemoveNotification(notification)"></BaseIcon>
      </div>
    </div>
  </teleport>
</template>
<style lang="scss" scoped src="./notification.scss"></style>
<script lang="ts" src="./notification.ts"></script>
