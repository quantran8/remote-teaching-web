<template>
  <AppHeader class="header" :title="title">
    <template #right>
      <ResourceMenu />
      <LanguagePicker />
	  <HelpMenu/>
      <UserAvatar>
        <template #extraItems>
          <DropdownItem :text="testConnectText" @click.prevent="onClickTestDevice" />
        </template>
      </UserAvatar>
    </template>
    <DeviceTester :notJoin="true" ref="deviceTesterRef" />
  </AppHeader>
</template>
<style src="./header.scss" lang="scss" scoped></style>
<script src="./header.ts" lang="ts"></script>
