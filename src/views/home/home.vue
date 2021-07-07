<template>
  <div class="home">
    <p></p>
    <h2>{{ welcomeText }}{{ username }}</h2>
    <p>{{ chooseRoleText }}</p>
    <hr />
    <p></p>
    <div class="content-container">
      <router-link to="/teacher">
        <div class="item-container teacher-container">
          <BaseIcon class="item-icon" name="icon-teacher" />
          <div class="item-name">{{ teacherText }}</div>
        </div>
      </router-link>
      <router-link to="/parent">
        <div class="item-container student-container">
          <BaseIcon class="item-icon" name="icon-student" />
          <div class="item-name">{{ studentText }}</div>
        </div>
      </router-link>
    </div>
  </div>
</template>
<style lang="scss" src="./home.scss"></style>
<script lang="ts" src="./home.ts"></script>
