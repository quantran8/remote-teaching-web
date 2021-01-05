<template>
  <teleport to="body">
    <div class="designate-target-container" v-if="currentExposureItemMedia">
      <div class="backdrop" @click="onClickCloseDesignate"></div>
      <div class="designate-wrap">
        <div class="designate-box" id="designate-box">
          <img :src="currentExposureItemMedia.image.url" id="mediaImage" />
          <Rectangle
              v-for="shape of rectangles"
              :key="shape.id"
              :id="shape.id"
              :x="shape.x"
              :y="shape.y"
              :width="shape.width"
              :height="shape.height"
              :zIndex="shape.zIndex"
          />
          <Circle
              v-for="shape of circles"
              :key="shape.id"
              :id="shape.id"
              :x="shape.x"
              :y="shape.y"
              :radius="shape.radius"
              :zIndex="shape.zIndex"
          />
          <Rectangle
              v-if="addingRect"
              :id="addingRect.id"
              :x="addingRect.x"
              :y="addingRect.y"
              :width="addingRect.width"
              :height="addingRect.height"
              :zIndex="addingRect.zIndex"
          />
          <Circle
              v-if="addingCircle"
              :id="addingCircle.id"
              :x="addingCircle.x"
              :y="addingCircle.y"
              :radius="addingCircle.radius"
              :zIndex="addingCircle.zIndex"
          />
        </div>
        <div class="designate-box-right">
          <h3>Students</h3>
          <div class="designate-box-right--student-list">
            <StudentList
                v-for="student in studentIds"
                :key="student.id"
                :id="student.id"
                :name="student.name"
                :index="student.index"
                :status="student.status"
                :selected="student.selected"
                @click="onClickToggleStudent(student)"
            />
          </div>
          <div class="designate-box-right--button">
            <BaseButton class="btn-primary" @click="onClickClearAllTargets">Clear All Targets</BaseButton>
            <BaseButton class="btn-primary">Reveal All Targets</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
<style lang="scss" scoped src="./designate-target.scss"></style>
<script lang="ts" src="./designate-target.ts"></script>
