<template>
  <div class="class-holder">
    <div class="class" @click="clickToAccess">
      <BaseCard class="class__size">
        <div class="m-10">
          <div class="class__title">
            <h5 class="title">{{ title }}</h5>
            <span class="description">{{ description }}</span>
          </div>
          <BaseButton mode="clear" color="primary">{{ btnText }}</BaseButton>
        </div>
      </BaseCard>
    </div>
    <div class="class-group" @click="clickToAccess" v-for="item in [1, 2, 3]" v-bind:key="item">
      <BaseCard class="class-group__size">
        <!-- The next upcoming class group i.e. the group which has the next class based on the timing would be highlighted. -->
        <!-- <BaseCard class="class-group__size hightlight"> -->
        <div class="m-10">
          <h2 class="title">Group-{{ item }}</h2>
          <span class="description d-block">Members: 12</span>
          <span class="description">Next: 4/1 14:00</span>
          <!-- <img class="class-group__play-icon" src="@/assets/images/play.png" /> -->
        </div>
      </BaseCard>
    </div>
  </div>
</template>
<style lang="scss" src="./class-card.scss" scoped></style>
<script lang="ts" src="./class-card.ts"></script>
