<template>
  <div class="class-holder">
    <div class="class">
      <BaseCard class="class__size">
        <div class="m-10">
          <div class="class__title">
            <h5 class="title">{{ title }}</h5>
            <span class="description">{{ description }}</span>
          </div>
        </div>
      </BaseCard>
    </div>
    <div class="class-group">
      <BaseCard :class="item.isCurrentDay ? 'class-group__size hightlight' : 'class-group__size'" v-for="item in groups" v-bind:key="item">
        <div class="m-10">
          <h2 class="title">Group - {{ item.groupName }}</h2>
          <span class="description d-block">Members: {{ item.studentCount }}</span>
          <span class="description">Next: {{ item.next }}</span>
          <img v-show="item.isCurrentDay && item.startClass" class="class-group__play-icon" src="@/assets/images/play.png" @click="clickToAccess" />
        </div>
      </BaseCard>
    </div>
  </div>
</template>
<style lang="scss" src="./class-card.scss" scoped></style>
<script lang="ts" src="./class-card.ts"></script>
