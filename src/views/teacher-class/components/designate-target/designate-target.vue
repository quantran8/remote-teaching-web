<template>
  <teleport to="body">
    <div class="designate-target-container" v-if="currentExposureItemMedia">
      <div class="backdrop" @click="onClickCloseDesignate"></div>
      <div class="designate-wrap">
        <div class="designate-box" id="designate-box" :class="{ active: isTabActive('designate-target-action') }">
          <img :src="currentExposureItemMedia.image.url" id="mediaImage" @load="onLoaded" />
          <DesignateRectangle
            v-for="shape of rectangles"
            :key="shape.id"
            :id="shape.id"
            :x="shape.x"
            :y="shape.y"
            :width="shape.width"
            :height="shape.height"
            :zIndex="shape.zIndex"
          />
          <DesignateCircle
            v-for="shape of circles"
            :key="shape.id"
            :id="shape.id"
            :x="shape.x"
            :y="shape.y"
            :radius="shape.radius"
            :zIndex="shape.zIndex"
          />
          <DesignateRectangle
            v-if="addingRect"
            :id="addingRect.id"
            :x="addingRect.x"
            :y="addingRect.y"
            :width="addingRect.width"
            :height="addingRect.height"
            :zIndex="addingRect.zIndex"
          />
          <DesignateCircle
            v-if="addingCircle"
            :id="addingCircle.id"
            :x="addingCircle.x"
            :y="addingCircle.y"
            :radius="addingCircle.radius"
            :zIndex="addingCircle.zIndex"
          />
        </div>
        <div id="canvas-container" @mousemove="cursorPosition" :class="{ active: isTabActive('annotation-action') }">
          <img :src="currentExposureItemMedia.image.url" id="annotation-img" />
          <div class="wrap-canvas">
            <canvas class="canvas-designate" id="canvasDesignate" />
          </div>
        </div>
        <div class="designate-box-right">
          <div class="designate-box-right--tab">
            <BaseButton
              class="btn-primary"
              @click.prevent="setTabActive('designate-target-action')"
              :class="{ active: isTabActive('designate-target-action') }"
              >{{ designateBtnText }}</BaseButton
            >
            <BaseButton
              class="btn-primary"
              @click.prevent="setTabActive('annotation-action')"
              :class="{ active: isTabActive('annotation-action') }"
              >{{ annotationBtnText }}</BaseButton
            >
          </div>
          <div class="designate-box-right--tab-content">
            <div class="designate-box-right--tab-pane" id="designate-target-action" :class="{ active: isTabActive('designate-target-action') }">
              <h3>{{ studentTitleText }}</h3>
              <BaseButton mode="clear" class="btn-primary designate-box-right__button--assign-all" @click="onClickToggleAssignAllStudents">
                {{ textAssignAll }}
              </BaseButton>
              <div class="designate-box-right--student-list">
                <StudentList
                  v-for="student in studentIds"
                  :key="student.id"
                  :id="student.id"
                  :name="student.englishName"
                  :index="student.index"
                  :status="student.status"
                  :selected="student.selected"
                  @click="onClickToggleStudent(student)"
                />
              </div>
              <div class="designate-box-right--button">
                <BaseButton class="btn-primary green" @click="onClickAssignDesignate">{{ assignAllText }}</BaseButton>
              </div>
              <div class="designate-box-right--button">
                <BaseButton class="btn-primary" @click="onClickClearAllTargets">{{ clearAllText }}</BaseButton>
                <BaseButton class="btn-primary" @click="onClickRevealAllTargets">{{ revealAllText }}</BaseButton>
              </div>
            </div>
            <div class="designate-box-right--tab-pane" id="annotation-action" :class="{ active: isTabActive('annotation-action') }">
              <ToolsCanvas
                :selector-open="selectorOpen"
                :tool-selected="toolSelected"
                :stroke-width="strokeWidth"
                :stroke-color="strokeColor"
                :sticker-tool="hasStickerTool"
                @tool-selected="clickedTool"
                @update-color="updateColorValue"
                @update-stroke="updateStrokeWidth"
              />
            </div>
          </div>
          <div class="designate-box-right__navigation">
            <BaseButton class="btn-primary" v-if="prevExposureItemMedia !== undefined" @click="onClickNextPrevMedia(0)">{{
              previousText
            }}</BaseButton>
            <BaseButton class="btn-primary" v-if="nextExposureItemMedia !== undefined" @click="onClickNextPrevMedia(1)">{{ nextText }}</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
<style lang="scss" scoped src="./designate-target.scss"></style>
<script lang="ts" src="./designate-target.ts"></script>
