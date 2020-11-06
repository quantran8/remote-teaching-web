<template>
  <MainLayout>
    <template v-if="isHeaderVisible" v-slot:header>
      <AppHeader title="Remote Teaching" @click="refresh"/>
    </template>
    <router-view />
    <template v-if="isFooterVisible" v-slot:footer>
      <AppFooter />
    </template>
  </MainLayout>
</template>
<script lang="ts" src="./app.ts"/>
<style lang="scss" src="./app.scss"/>
