<template>
  <div class="header">
    <DeviceTester :notJoin="true" ref="deviceTesterRef" />
    <slot name="leading">
      <a :href="url">
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
    <div class="drawer-button-mobile" @click="onClickOpenDrawer"><MoreOutlined/></div>
    <LanguagePicker class="desktop" />
    <slot name="actions">
      <MenuItem class="user-container-wrap desktop" v-if="isLoggedIn">
        <div class="user-container">
          <img class="user-avatar" :src="userAvatar" alt="User Avatar" />
          <div class="user-info">
            <div class="user-name">{{ userName }}</div>
            <div class="user-role">{{ userRole }}</div>
          </div>
        </div>
        <DownOutlined />
        <template v-slot:popup>
          <div class="menu-item" @click.prevent="onClickOpenAccountPage">
            <div class="item-title">{{ editProfileText }}</div>
            <BaseIcon class="item-action" name="reply" />
          </div>
          <div class="menu-item" @click.prevent="onClickTestDevice">{{ testConnectText }}</div>
          <div class="menu-item" @click.prevent="onClickSignOut">{{ signOutText }}</div>
        </template>
      </MenuItem>
    </slot>
    <Drawer class="drawer-wrap-mobile" placement="right" :visible="showDrawer" @close="onClickCloseDrawer">
      <div class="drawer-wrap-mobile__content">
        <LanguagePicker class="mobile" />
        <slot name="actions">
          <MenuItem class="user-container-wrap" v-if="isLoggedIn">
            <div class="user-container">
              <img class="user-avatar" :src="userAvatar" alt="User Avatar" />
              <div class="user-info">
                <div class="user-name">{{ userName }}</div>
                <div class="user-role">{{ userRole }}</div>
              </div>
            </div>
            <DownOutlined />
            <template v-slot:popup>
              <div class="menu-item" @click.prevent="onClickOpenAccountPage">
                <div class="item-title">{{ editProfileText }}</div>
                <BaseIcon class="item-action" name="reply" />
              </div>
              <div class="menu-item" @click.prevent="onClickTestDevice">{{ testConnectText }}</div>
              <div class="menu-item" @click.prevent="onClickSignOut">{{ signOutText }}</div>
            </template>
          </MenuItem>
        </slot>
      </div>
    </Drawer>
  </div>
</template>
<style src="./header.scss" lang="scss" scoped></style>
<script src="./header.ts" lang="ts"></script>
