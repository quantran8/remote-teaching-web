<template>
  <div class="component tools" :class="{ 'tools--has-sticker': stickerTool }">
    <template v-for="(toolName, index) in toolNames" :key="index">
      <div
        class="tools__item"
        :class="{
          selected: toolSelected === toolName,
          'tools__item--sticker': toolName === tools.AddSticker || toolName === tools.AssignSticker,
        }"
        @click="clickedTool(toolName)"
      >
        <div class="tools__item__icon" :class="[toolName, { selected: toolSelected === toolName }]">
          <div v-if="toolName === tools.Stroke" class="tools__item__icon__stroke-line" :style="`height: ${strokeWidth * 1.2}px;`"></div>
          <!-- <div
            v-if="toolName === tools.StrokeColor"
            class="tools__item__icon__stroke-color"
            :style="`background-color: ${strokeColor}`"
          ></div> -->
        </div>

        <!-- <p class="tools__item__name">{{ toolNameMap[toolName] }}</p> -->
		 <div class="tools__item__action__icons" v-if="toolName !== tools.Stroke && toolName !== tools.Delete && toolName !== tools.AddSticker && toolName !== tools.AssignSticker">
  			<img :src="require(`@/assets/icons/tools-${toolName}.svg`)" alt="Icon" />
		  </div>
        <div
          class="tools__item__submenu"
          :class="[toolName, { open: true }]"
          @click.stop="() => {}"
          :key="index"
        >
          <div
            v-if="toolsWithDropdown.includes(toolName)"
            class="tools__item__submenu__content"
            :class="[toolName, { open: selectorOpen && toolSelected === toolName }]"
          >
            <template v-if="toolName === tools.StrokeColor">
              <div
                v-for="(color, index) in colorsList"
                :key="index"
                class="color-item"
                :style="`background-color: ${color}`"
                @click="updateColor(color)"
              ></div>
            </template>
            <template v-else-if="toolName === tools.Stroke" v-for="(size, index) in strokeSize" :key="index">
              <div class="stroke-item" @click="updateStrokeSize(size)">
                <div class="stroke-item-line" :style="`height: ${size * 1.2}px`"></div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<style lang="scss" scoped src="./tools-canvas.scss"></style>
<script lang="ts" src="./tools-canvas.ts"></script>
