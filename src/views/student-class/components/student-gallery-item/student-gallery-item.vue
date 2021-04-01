<template>
  <div :class="['sc-gallery-item', isCurrent && 'sc-gallery-item--large']">
    <img v-if="student.avatar" class="sc-gallery-item__img" :src="student.avatar" />
    <img v-else class="sc-gallery-item__img" src="@/assets/student-class/no-avatar.png" />
    <h3 class="sc-gallery-item__title">{{ student.name }}</h3>
    <span class="sc-gallery-item__star" v-if="isCurrent">
      <span class="sc-gallery-item__star__content">{{ student.badge }}</span>
    </span>
  </div>
</template>
<script lang="ts" src="./student-gallery-item.ts"></script>
<style lang="scss" scoped src="./student-gallery-item.scss"></style>
