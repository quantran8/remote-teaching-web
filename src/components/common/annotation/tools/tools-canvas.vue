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
        </div>
        <div
          @click="handleIconClick(toolName)"
          :class="['tools__item__action__icons', { selected: toolSelected === toolName && toolName !== tools.StrokeColor }]"
        >
          <img v-if="checkHasIcon(toolName)" :src="require(`@/assets/icons/tools-${toolName}.svg`)" alt="Icon" />
          <div :style="`background-color: ${strokeColor}`" v-if="toolName === tools.Pen" class="color-signal"></div>
        </div>
        <div class="tools__item__submenu" :class="[toolName, { open: true }]" @click.stop="() => {}" :key="index">
          <div
            v-if="toolsWithDropdown.includes(toolName)"
            class="tools__item__submenu__content"
            :class="[toolName, { open: selectorOpen && toolSelected === toolName }]"
          >
            <template v-if="toolName === tools.StrokeColor">
              <div
                v-for="(color, index) in colorsList"
                :key="index"
				:class="['color-item', { 'color-item--has-border': color === 'white' }]"
                :style="`background-color: ${color}`"
                @click="
                  clickedTool(toolName);
                  updateColor(color);
                "
              ></div>
            </template>
            <div class="stroke__wrapper" v-else-if="toolName === tools.Stroke && showFontWeightPopover">
              <template v-for="(size, index) in strokeSize" :key="index">
                <div
                  class="stroke-item"
                  @click="
                    updateStrokeSize(size);
                    handleIconClick(toolName);
                  "
                >
                  <div class="stroke-item-line" :style="`height: ${size * 1.2}px`"></div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<style lang="scss" scoped src="./tools-canvas.scss"></style>
<script lang="ts" src="./tools-canvas.ts"></script>
