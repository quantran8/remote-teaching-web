<template>
  <div class="teacher-page">
    <p></p>
    <h2>Welcome {{ username }}</h2>
    <p>Choose a class to start</p>
    <hr />
    <p></p>
    <div>
      <ClassCard
        class="card-margin"
        v-for="cl in classes"
        :key="cl.schoolClassId"
        :id="cl.schoolClassId"
        :title="cl.schoolClassName"
        :description="cl.schoolName"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./teacher.scss"></style>
<script lang="ts" src="./teacher.ts"></script>