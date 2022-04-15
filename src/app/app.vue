<template>
  <LoadingPage v-if="appView === AppView.Blank" />
  <NotFoundPage v-else-if="appView === AppView.NotFound" />

  <MainLayout v-else-if="appView === AppView.UnAuthorized">
    <template v-slot:header>
      <AppHeader :title="siteTitle" />
    </template>
    <AccessDeniedPage />
    <template v-slot:footer>
      <AppFooter />
    </template>
  </MainLayout>
  <MainLayout v-else>
    <template v-if="isHeaderVisible" v-slot:header>
      <AppHeader :title="siteTitle" />
    </template>
    <router-view />
    <div class="disconnected-popup" v-if="isDisconnectedMode && isTeacher">{{ messageText }}</div>
    <template v-if="isFooterVisible" v-slot:footer>
      <AppFooter />
    </template>
  </MainLayout>
  <Toast></Toast>
  <Notification></Notification>
</template>
<script lang="ts" src="./app.ts" />
<style lang="scss" src="./app.scss" />
