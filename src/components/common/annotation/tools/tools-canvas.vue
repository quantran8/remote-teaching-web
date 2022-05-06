<template>
  <div class="tools tools--custom">
    <Row align="middle" type="flex" justify="center">
      <div class="ant-col-12 tools__item tools__item--custom" @click="clickedTool('cursor')">
        <div class="tools__item__wrap" :class="{ selected: toolSelected === 'cursor' }">
          <img class="tools__item__iconImg" src="@/assets/tools/Cursor.svg" alt="Cursor Icon" />
        </div>
      </div>
      <div class="ant-col-12 tools__item tools__item--custom" @click="clickedTool('TextBox')">
        <div class="tools__item__wrap" :class="{ selected: toolSelected === 'TextBox' }">
          <img class="tools__item__iconImg" src="@/assets/tools/InputText_Icon.png" alt="Text Icon" />
        </div>
      </div>
    </Row>
    <Divider />
    <Row align="middle" type="flex" justify="center">
      <div class="ant-col-12 tools__item tools__item--custom" @click="clickedTool('laser')">
        <div class="tools__item__wrap" :class="{ selected: toolSelected === 'laser' }">
          <img class="tools__item__iconImg tools__item__iconImg--laser" src="@/assets/tools/LaserPointer.svg" alt="Laser Icon" />
        </div>
      </div>
      <div class="ant-col-12 tools__item tools__item--custom" @click="clickedTool('pen')">
        <div class="tools__item__wrap" :class="{ selected: toolSelected === 'pen' }">
          <img class="tools__item__iconImg" src="@/assets/tools/Pencil.svg" alt="Pen Icon" />
        </div>
      </div>
    </Row>
    <Divider />
    <Row align="middle" type="flex" justify="center">
      <div class="ant-col-12 tools__item tools__item--custom">
        <Popover v-model:visible="showListSize" trigger="click">
          <template #content>
            <Space direction="vertical">
              <div
                class="stroke-list"
                v-for="(size, index) in strokeSize"
                :key="index"
                @click="
                  updateStrokeSize(size);
                  hideListSize();
                "
              >
                <div class="stroke-item-new" :style="`height: ${size * 1.2}px`"></div>
              </div>
            </Space>
          </template>
          <div
            class="tools__item__wrap"
            :class="{ selected: toolSelected === 'stroke', thin: strokeWidth === 2, thick: strokeWidth === 4 }"
            @click="clickedTool('stroke')"
          >
            <img class="tools__item__iconImg tools__item__iconImg--size" src="@/assets/tools/StrokeSize.svg" alt="Size Icon" />
          </div>
        </Popover>
      </div>
      <div class="ant-col-12 tools__item tools__item--custom">
        <Popover v-model:visible="showListColors" trigger="click blur">
          <template #content>
            <div class="colors-wrap">
              <div
                v-for="(color, index) in colorsList"
                :key="index"
                :style="`background-color: ${color}`"
                :class="color === 'white' ? 'colors-item has-border' : 'colors-item'"
                @click="
                  updateColor(color);
                  hideListColors();
                "
              ></div>
            </div>
          </template>
          <div
            class="tools__item__wrap"
            :class="{ selected: toolSelected === 'stroke-color', white: strokeColor === 'white' }"
            @click="clickedTool('stroke-color')"
          >
            <img
              class="tools__item__iconImg"
              :src="require(`@/assets/tools/ColorSelectScribble-${strokeColor}.svg`)"
              alt="Color Icon"
              :style="{ color: strokeColor }"
            />
          </div>
        </Popover>
      </div>
    </Row>
    <Divider />
    <Row align="middle" type="flex" justify="space-around">
      <div class="ant-col-8 tools__item tools__item--custom" @click="clickedTool('circle')">
        <div class="tools__item__wrap" :class="{ selected: toolSelected === 'circle' }">
          <img class="tools__item__iconImg" src="@/assets/tools/Circle.svg" alt="Circle Icon" />
        </div>
      </div>
      <div class="ant-col-8 tools__item tools__item--custom" @click="clickedTool('square')">
        <div class="tools__item__wrap" :class="{ selected: toolSelected === 'square' }">
          <img class="tools__item__iconImg" src="@/assets/tools/Square.svg" alt="Square Icon" />
        </div>
      </div>
    </Row>
    <Divider />
    <Row align="middle" type="flex" justify="center">
      <div class="ant-col-12 tools__item tools__item--custom" @click="clickedTool('delete')">
        <div class="tools__item__wrap" :class="{ selected: toolSelected === 'delete' }">
          <img class="tools__item__iconImg" src="@/assets/tools/EraseOne.svg" alt="Delete Icon" />
        </div>
      </div>
      <div class="ant-col-12 tools__item tools__item--custom" @click="clickedTool('clear')">
        <div class="tools__item__wrap" :class="{ selected: toolSelected === 'clear' }">
          <img class="tools__item__iconImg" src="@/assets/tools/EraseAll.svg" alt="Clear Icon" />
        </div>
      </div>
    </Row>
  </div>
</template>
<style lang="scss" scoped src="./tools-canvas.scss"></style>
<script lang="ts" src="./tools-canvas.ts"></script>
