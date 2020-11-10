<template>
  <div class="header">
    <slot name="leading">
      <a href="/">
        <img src="@/assets/logo-white.svg" alt="" class="logo" />
      </a>
    </slot>
    <div class="h-spacer"></div>
    <div class="content">
      <slot name="title">
        <div class="title">{{ title }}</div>
      </slot>
      <slot />
    </div>
    <slot name="actions">
      <MenuItem class="user-container">
        <div class="user-container">
          <img
            class="user-avatar"
            src="@/assets/images/user-default.png"
            alt="User Avatar"
          />
          <div class="user-info">
            <div class="user-name">user name</div>
            <div class="user-role">(user role)</div>
          </div>
        </div>
        <template v-slot:popup>
          <div>hello</div>
          <div>hello 1</div>
          <div>hello 2</div>
        </template>
      </MenuItem>
    </slot>
  </div>
</template>
<style src="./header.scss" lang="scss" scoped ></style>
<script src="./header.ts" lang="ts"></script>
