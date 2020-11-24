<template>
  <div class="page-container">
    <h3>Student View</h3>

    <button @click.prevent="joinZoom">Join Zooom</button>
    <button @click.prevent="startStream">start Stream</button>
    <hr />
    <p></p>
    <div id="userStreamID"></div>

    <div class="user-stream-container">
      <div class="user-stream" id="userStream1"></div>
      <div class="user-stream" id="userStream2"></div>
      <div class="user-stream" id="userStream3"></div>
      <div class="user-stream" id="userStream4"></div>
      <div class="user-stream" id="userStream5"></div>
      <div class="user-stream" id="userStream6"></div>
      <div class="user-stream" id="userStream7"></div>
      <div class="user-stream" id="userStream8"></div>
      <div class="user-stream" id="userStream9"></div>
      <div class="user-stream" id="userStream10"></div>
      <div class="user-stream" id="userStream11"></div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-view.scss"></style>
<script lang="ts" src="./student-view.ts"></script>