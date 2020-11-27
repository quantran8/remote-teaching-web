<template>
  <BaseModal @close="onClickDismiss">
    <div class="modal-boxshadow leave-modal">
      <div class="header">{{ title }}</div>
      <div class="body">
        <slot name="content">
          <p>{{ message }}</p>
        </slot>
      </div>
      <div class="footer">
        <slot name="actions">
          <BaseButton class="btn-primary" @click="onClickConfirm"
            >Ok</BaseButton
          >
        </slot>
      </div>
    </div>
  </BaseModal>
</template>
<style lang="scss" scoped src="./error-modal.scss"></style>
<script lang="ts" src="./error-modal.ts"></script>