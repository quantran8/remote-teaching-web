<template>
  <div class="page-container">
    <h3>Student View</h3>

    <button @click.prevent="joinZoom">Join Zooom</button>
    <button @click.prevent="startStream">start Stream</button>
    <hr />
    <p></p>
    <div id="userStreamID"></div>
  </div>
</template>
<style lang="scss" scoped src="./student-view.scss"></style>
<script lang="ts" src="./student-view.ts"></script>