<template>
  <div class="student-page">
    <p></p>
    <h2>Welcome {{ username }}</h2>
    <p>Choose a student to start</p>
    <hr />
    <p></p>
    <div class="list-student">
      <StudentCard
        v-for="child in children"
        :key="child.id"
        :name="child.name"
        @click="()=>onClickChild(child)"
      >
      </StudentCard>
    </div>
  </div>
</template>

<style lang="scss" scoped src="./student.scss"></style>
<script lang="ts" src="./student.ts"></script>