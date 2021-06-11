<template>
  <div class="home">
    <p></p>
    <h2>Welcome {{ username }}</h2>
    <p>Choose a role to start</p>
    <hr />
    <p></p>
    <div class="content-container">
      <router-link to="/teacher">
        <div class="item-container teacher-container">
          <BaseIcon class="item-icon" name="icon-teacher" />
          <div class="item-name">Teacher</div>
        </div>
      </router-link>
      <router-link to="/parent">
        <div class="item-container student-container">
          <BaseIcon class="item-icon" name="icon-student" />
          <div class="item-name">Student</div>
        </div>
      </router-link>
    </div>
  </div>
</template>
<style lang="scss" src="./home.scss"></style>
<script lang="ts" src="./home.ts"></script>
