<template>
  <div class="header">
    <div class="header__left">
      <div class="header__left--below"></div>
      {{ teacherName }}
      <div class="box">
        <label class="label-reactions">
          <img v-if="classAction.icon" :src="require(`@/assets/icons/icon-action-${classAction.icon}.png`)" />
          <img v-else src="@/assets/student-class/class-icon.svg" />
          <span v-if="classAction.id === 'default'" class="class-actions-title">{{ classActionsTitle }}</span>
        </label>
        <div class="toolbox"></div>
        <label class="overlay"></label>
        <div class="actions">
          <button class="reaction-icon" @click="() => onClickSelectAction(action)" v-for="action of actions" :key="action.id">
            <img :src="require(`@/assets/icons/icon-action-${action.id}.png`)" />
            <span class="action-text">{{ genBearActionLabel(action.id) }}</span>
          </button>
        </div>
      </div>
    </div>
    <div class="header__right">
      {{ className }}
    </div>
    <a class="header__exit" href="javascript:void(0)" @click="onClickEnd">
      <MatIcon type="close" class="red-close" />
      <span>Exit</span>
    </a>
  </div>
</template>
<script lang="ts" src="./teacher-page-header.ts"></script>
<style lang="scss" scoped src="./teacher-page-header.scss"></style>
