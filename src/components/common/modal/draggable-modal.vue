<template>
  <vue-final-modal
    v-model="visible"
    content-class="modal-content"
    :resize="true"
    :drag="true"
    :drag-selector="'.final-modal__header--layer'"
    :click-to-close="false"
    :min-width="150"
    :min-height="150"
  >
    <div class="final-modal">
      <div class="final-modal__header">
        <div class="final-modal__header--layer">
          <div class="final-modal__header--icon-wrap" @click="toggleModal">
            <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
        </div>
        <div class="final-modal__header--title">{{ title }}</div>
      </div>
      <div class="final-modal__content nice-scroll">
        <slot name="final-modal-content"></slot>
      </div>
    </div>
  </vue-final-modal>
</template>
<script lang="ts" src="./draggable-modal.ts"></script>
<style lang="scss">
.modal-content {
  box-sizing: border-box;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  background: #fff;
  width: 40%;
  height: 40%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.final-modal {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  &__header {
    position: relative;
    &:hover {
      cursor: move;
    }
    padding: 23px 16px;
    overflow: hidden;
    background: white;
    display: flex;
    align-items: center;
    &--title {
      font-weight: 600;
      font-size: 20px;
      user-select: none;
    }
    &--layer {
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      position: absolute;
      z-index: 1;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 16px;
    }
    &--icon-wrap {
      width: 32px;
      height: 32px;
      display: flex;
      justify-content: center;
      align-content: center;
      border-radius: 5px;
      &:hover {
        cursor: pointer;
      }
      svg {
        color: rgb(156, 163, 175);
      }
      &:hover {
        background: rgb(229, 231, 235);
        svg {
          color: rgb(75, 85, 99);
        }
      }
    }
    border-bottom: 0.8px solid rgb(229, 231, 235);
  }
  &__content {
    padding: 20px;
    width: 100%;
    height: 100%;
    overflow: auto;
  }
}
</style>
