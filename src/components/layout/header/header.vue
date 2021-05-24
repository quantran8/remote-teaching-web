<template>
  <div class="header">
    <slot name="leading">
      <router-link to="/">
        <img src="@/assets/logo-white.svg" alt="" class="logo" />
      </router-link>
    </slot>
    <div class="h-spacer"></div>
    <div class="content">
      <slot name="title">
        <div class="title">{{ title }}</div>
      </slot>
      <slot />
    </div>
    <div class="locale-switcher">
      🌐 {{$i18n.locale}}
      <select v-model="$i18n.locale">
        <option value="en">English</option>
        <option value="ar-sa">العربية</option>
        <option value="es">Español</option>
        <option value="zh-cn">中文</option>
        <option value="ms">中文(马来西亚)</option>
        <option value="ja">日本語</option>
        <option value="ko">한국어</option>
        <option value="ru">Русский</option>
        <option value="vi">Tiếng Việt</option>
        <option value="mn">Монгол</option>
        <option value="th">ภาษาไทย</option>
      </select>
    </div>
    <slot name="actions">
      <MenuItem class="user-container" v-if="isLoggedIn">
        <div class="user-container">
          <img class="user-avatar" :src="userAvatar" alt="User Avatar" />
          <div class="user-info">
            <div class="user-name">{{ userName }}</div>
            <div class="user-role">{{ userRole }}</div>
          </div>
        </div>
        <template v-slot:popup>
          <div class="menu-item" @click.prevent="onClickOpenAccountPage">
            <div class="item-title">Edit Profile</div>
            <BaseIcon class="item-action" name="reply" />
          </div>
          <div class="menu-item" @click.prevent="onClickSignOut">Sign Out</div>
        </template>
      </MenuItem>
    </slot>
  </div>
</template>
<style src="./header.scss" lang="scss" scoped ></style>
<script src="./header.ts" lang="ts"></script>
