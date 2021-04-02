<template>
    <div v-if="oneAndOneStatus" class="align">
      <StudentOne />
    </div>
    <div v-else>
      <StudentAll />
    </div>
</template>
<style lang="scss" scoped src="./student-gallery.scss"></style>
<script lang="ts" src="./student-gallery.ts"></script>
