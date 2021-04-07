<template>
  <div class="cg-row">
    <ClassCard
      class="card-margin"
      :key="schoolClass.schoolClassId"
      :id="schoolClass.schoolClassId"
      :title="schoolClass.schoolClassName"
      :description="schoolClass.campusName"
      :active="schoolClass.isActive"
      @click="() => onClickClass(schoolClass)"
    />
    <div class="cg-row__between">
      <Between :key="item" v-for="item in [...Array(80 - 25 * (schoolClass.groups || []).length).keys()]"></Between>
    </div>
    <div class="cg-row__g-cards">
      <GroupCard
        v-for="group in schoolClass.groups || []"
        :key="group.id"
        :title="group.name"
        :studentCount="group.studentCount"
        :nextSchedule="group.nextSchedule"
        :canStartSession="canStartSession"
      />
    </div>
  </div>
</template>

<style lang="scss" src="./class-group-item.scss" scoped></style>
<script lang="ts" src="./class-group-item.ts"></script>