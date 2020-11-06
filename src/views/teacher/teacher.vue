<template>
  <div class="teacher-page">
    <p></p>
    <h2>Welcome {{ username }}</h2>
    <p>Choose a class to start</p>
    <hr />
    <p></p>
    <div>
      <ClassCard
        v-for="cl in classes"
        :key="cl.id"
        class="card-margin"
        :id="cl.id"
        :title="cl.title"
        :description="cl.description"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./teacher.scss"></style>
<script lang="ts" src="./teacher.ts"></script>