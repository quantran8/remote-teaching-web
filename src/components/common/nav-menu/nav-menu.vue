<template>
  <div class="nav-menu">
    <div class="nav-menu__item" @click="onClickHome">
      <img class="nav-menu__icon" src="@/assets/images/home-class.png" />
      <span>{{ homeText }}</span>
    </div>
    <div class="nav-menu__item ml-5" @click="onClickCalendar">
      <img class="nav-menu__icon" src="@/assets/images/today-icon.png" />
      <span>{{ scheduleText }}</span>
    </div>
    <!-- <div class="nav-menu__item">
        <img class="nav-menu__icon" src="@/assets/images/image-icon.png" />
        <span>{{ galleryText }}</span>
      </div> -->
  </div>
</template>
<style lang="scss" scoped src="./nav-menu.scss"></style>
<script lang="ts" src="./nav-menu.ts"></script>
