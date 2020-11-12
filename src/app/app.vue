<template>
  <LoadingPage v-if="appView === 4" />
  <NotFoundPage v-else-if="appView === 3" />
  <AccessDeniedPage v-else-if="appView === 2" />
  <MainLayout v-else>
    <template v-if="isHeaderVisible" v-slot:header>
      <AppHeader title="Remote Teaching" />
    </template>
    <router-view />
    <template v-if="isFooterVisible" v-slot:footer>
      <AppFooter />
    </template>
  </MainLayout>
</template>
<script lang="ts" src="./app.ts"/>
<style lang="scss" src="./app.scss"/>
