<template>
  <div>
    <div v-for="child in children" :key="child.id">
      {{ child.name }}
    </div>
  </div>
</template>

<style lang="scss" scoped src="./student.scss"></style>
<script lang="ts" src="./student.ts"></script>