<template>
  <Teleport to="body">
    <vue-final-modal
      v-model="showed"
      :classes="PINNING_MODAL_CONTAINER"
      :content-class="[MODAL_CONTENT, pressing && 'translating']"
      :resize="pined"
      :drag="pined"
      :click-to-close="false"
      :min-width="150"
      :min-height="100"
      :hide-overlay="true"
      :prevent-click="true"
    >
      <div :class="['final-modal', !pined && showed && 'has-before', pined && 'cursor-move']">
        <div class="final-modal__content final-modal-scroll">
          <div class="final-modal__close" @mousedown="onMouseDown" @mouseup="onMouseUp">
            <PushpinOutlined style="color: gray" class="final-modal__close--icon" v-if="!pined && showed" />
            <CloseOutlined class="final-modal__close--icon" v-if="pined && showed" style="color: gray" />
          </div>
          <slot name="final-modal-content"></slot>
        </div>
      </div>
    </vue-final-modal>
  </Teleport>
</template>
<script lang="ts" src="./pinning-modal.ts"></script>
<style lang="scss">
.vfm-modal-content {
  box-sizing: border-box;
  position: absolute;
  border-radius: 0.25rem;
  padding: 30px 5px;
  padding-bottom: 10px;
  font-size: 14px;
  position: absolute;
  background-color: rgba(255, 245, 135, 1);
  position: absolute;
  color: gray;
  text-align: start;
  border-bottom: 1px solid #c1c1c1;
  box-shadow: 0px 0px 7px rgba(112, 112, 112, 0.45);
  transition: box-shadow 0.5s, transform 0.25s;
  &:hover {
    box-shadow: 0px 0px 12px rgb(161, 151, 36);
  }
  min-width: 100px;
  min-height: 100px;
  &.translating {
    transform: translate(3px, 3px);
  }
  .final-modal {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    max-height: 75vh;
    &__content {
      padding: 10px 20px;
      width: 100%;
      height: 100%;
      overflow: auto;
      &:hover {
        // prevent text selection when move the modal
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    }
    &__close {
      position: absolute;
      top: 0;
      right: 0;
      padding: 0.5em;
      cursor: pointer;
      &--icon {
        transition: all 0.2s;
        &:hover {
          box-shadow: 0 1rem 2rem rgba(black, 0.15);
          transform: translateY(-1px);
          .modal-content {
            transform: scale(1.5);
          }
        }
        &:active {
          box-shadow: 0 0.5rem 1rem rgba(black, 0.15);
          transform: translateY(0);
        }
      }
    }
    &.has-before {
      &::before {
        content: "";
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 5px;
        border-style: solid;
        border-color: transparent transparent rgba(255, 245, 135, 1) transparent;
      }
    }
  }
}
</style>
