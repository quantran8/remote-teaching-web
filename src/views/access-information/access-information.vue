<template>
  <div class="access-information">
    <AppHeader :title="SiteTitle" />
    <div class="access-information__content">
      <div style="max-width: 900px">
        <p class="access-information__content--title">{{ Line1 }}</p>
        <p>{{ Line2 }}</p>
        <p>{{ Line3 }}</p>
        <p>{{ Line4 }}</p>
        <p>
          <span>{{ Line5Part1 }}</span>
          <a class="access-information__content--link" target="_blank" :href="contactURL">{{ Link }}</a>
          <span>{{ Line5Part2 }}</span>
        </p>
        <p class="access-information__content--sign">{{ Line6 }}</p>
      </div>
    </div>
    <AppFooter />
  </div>
</template>
<style lang="scss" scoped src="./access-information.scss"></style>
<script lang="ts" src="./access-information.ts"></script>
