<template>
  <LoadingPage v-if="appView === 4" />
  <NotFoundPage v-else-if="appView === 3" />

  <MainLayout v-else-if="appView === 2">
    <template v-slot:header>
      <AppHeader title="Remote Teaching" />
    </template>
    <AccessDeniedPage />
    <template v-slot:footer>
      <AppFooter />
    </template>
  </MainLayout>
  <MainLayout v-else>
    <template v-if="isHeaderVisible" v-slot:header>
      <AppHeader title="Remote Teaching" />
    </template>
    <router-view />
    <template v-if="isFooterVisible" v-slot:footer>
      <AppFooter />
    </template>
  </MainLayout>
  <Toast></Toast>
  <Notification></Notification>
</template>
<script lang="ts" src="./app.ts"/>
<style lang="scss" src="./app.scss"/>
