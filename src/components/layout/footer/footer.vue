<template>
  <div class="footer">
    <span class="footer-link" @click="openPrivacyPolicy">{{ privacyText }}</span>
    <span> V7 | Copyright © {{ new Date().getFullYear() }} GrapeSEED Media Ltd. All rights reserved</span>
  </div>
</template>
<script src="./footer.ts" lang="ts" />
<style src="./footer.scss" lang="scss" scoped />
