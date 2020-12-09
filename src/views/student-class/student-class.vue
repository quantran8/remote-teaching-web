<template>
  <div class="page-container">
    <div class="page-header">
      <div class="media-buttons">
        <BaseButton class="media-button" @click="toggleAudio" draggable="true">
          <BaseIcon :name="audioIcon"></BaseIcon>
        </BaseButton>
        <BaseButton class="media-button" @click="toggleVideo">
          <BaseIcon :name="videoIcon"></BaseIcon>
        </BaseButton>
      </div>

      <div class="current-student">
        <StudentCard
          v-if="student"
          class="student-card"
          :name="student.name"
          :id="student.id"
          :index="student.index"
          :badge="student.badge"
          :audioEnabled="student.audioEnabled"
          :videoEnabled="student.videoEnabled"
          :showBadge="true"
        />
      </div>
      <div class="fill-center">
        <StudentCard
          v-for="student in students.slice(0, 5)"
          :key="student.id"
          class="student-card"
          :name="student.name"
          :id="student.id"
          :index="student.index"
          :badge="student.badge"
          :audioEnabled="student.audioEnabled"
          :videoEnabled="student.videoEnabled"
        />
      </div>
    </div>
    <div class="page-content">
      <div class="controls">
        <div class="raise-question"></div>
        <div class="like"></div>
      </div>
      <div class="teacher-view" v-if="teacher">
        <div :id="teacher.id" class="teacher-camera"></div>
        <div class="teacher-name">{{ teacher.name }}</div>
      </div>
      <!-- <div class="content-view"></div> -->
    </div>
    <div class="page-footer">
      <div class="fill-center">
        <StudentCard
          v-for="student in students.slice(5)"
          :key="student.id"
          class="student-card"
          :name="student.name"
          :id="student.id"
          :index="student.index"
          :badge="student.badge"
          :audioEnabled="student.audioEnabled"
          :videoEnabled="student.videoEnabled"
        />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-class.scss"></style>
<script lang="ts" src="./student-class.ts"></script>