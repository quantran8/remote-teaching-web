<template>
  <div id="header">
    <div id="header__teacher">
      {{ teacherName }}
      <div class="box">
        <label class="label-reactions">
          <img v-if="classAction.icon" :src="require(`@/assets/icons/icon-action-${classAction.icon}.svg`)" />
          <img v-else src="@/assets/student-class/class-icon.svg">
        </label>
        <div class="toolbox"></div>
        <label class="overlay"></label>
        <div class="actions">
          <button
            class="reaction-icon"
            @click="() => onClickSelectAction(action)"
            v-for="action of actions"
            :key="action.icon"
          >
            <img :src="require(`@/assets/icons/icon-action-${action.icon}.svg`)" />
            <span class="action-text">{{action.icon}}</span>
          </button>
        </div>
      </div>
    </div>
    <div id="header__class-name">
      {{ className }}
    </div>
    <a href="javascript:" id="app-exit" @click="onClickEnd">Exit</a>
  </div>
</template>
<script lang="ts" src="./teacher-page-header.ts"></script>
<style lang="scss" scoped src="./teacher-page-header.scss"></style>
