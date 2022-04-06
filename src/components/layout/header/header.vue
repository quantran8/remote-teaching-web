<template>
  <AppHeader class="header" :title="title">
    <template #right>
      <LanguagePicker class="desktop" />
      <UserAvatar class="desktop">
        <template #menuItems>
          <div class="menu-item" @click.prevent="onClickTestDevice">{{ testConnectText }}</div>
        </template>
      </UserAvatar>
      <DrawerHelper>
        <LanguagePicker class="mobile" />
        <UserAvatar>
          <template #menuItems>
            <div class="menu-item" @click.prevent="onClickTestDevice">{{ testConnectText }}</div>
          </template>
        </UserAvatar>
      </DrawerHelper>
    </template>
    <DeviceTester :notJoin="true" ref="deviceTesterRef" />
  </AppHeader>
</template>
<style src="./header.scss" lang="scss" scoped></style>
<script src="./header.ts" lang="ts"></script>
