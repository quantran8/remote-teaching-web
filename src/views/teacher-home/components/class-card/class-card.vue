<template>
  <div v-if="loading">
    <span class="class-group__spin-icon">
      <Spin tip="Loading..." class="ant-custom-home" />
    </span>
  </div>
  <div class="class-holder" v-else>
    <div class="class">
      <BaseCard class="class__size class-block">
        <div class="h-100">
          <div class="class__title">
            <span class="class__title--name">{{ title }}</span>
            <div class="class__content">
              <span class="description mr-10">{{ unitText }} {{ unit }}</span>
              <span class="description">{{ lessonText }} {{ currentLesson }}</span>
            </div>
          </div>
        </div>
      </BaseCard>
      <!-- <div class="icon-container">
        <img class="gallery" src="@/assets/images/image-icon.png" />
        <span class="gallery__text">{{ galleryText }}</span>
      </div> -->
    </div>
    <div class="class-group">
      <div v-if="groups">
        <BaseCard :class="item.isHighLighted ? 'class-group__size hightlight' : 'class-group__size'" v-for="item in groups" v-bind:key="item">
          <div class="group-content" @click="clickToAccess(item.groupId, schoolId)">
            <div class="m-10">
              <h2 class="title">{{ groupText }} - {{ item.groupName }}</h2>
              <span class="description d-block mb">{{ membersText }}{{ item.studentCount }}</span>
              <span class="description d-block">{{ nextText }}</span>
              <span class="description d-block" v-if="item.next">{{ handleDateTime(item.next) }}</span>
            </div>
            <div class="icon-view" v-show="item.isCurrentDay && item.startClass">
              <span class="class-group__play-icon" v-if="clickedGroup === item.groupId && item.studentCount > 0 && loadingStart">
                <Spin spin type="loading" />
              </span>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
<style lang="scss" src="./class-card.scss" scoped></style>
<script lang="ts" src="./class-card.ts"></script>
