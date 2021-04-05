<template>
  <BaseModal @close="onClickDismiss">
    <div class="modal-boxshadow leave-modal">
      <div class="body">
        Are you sure to end this lesson?
      </div>
      <div class="footer">
        <BaseButton class="btn-secondary" @click="onClickDismiss" mode="outline"
          >Stay</BaseButton
        >
        <BaseButton class="btn-primary" @click="onClickLeave">Leave</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
<style lang="scss" scoped src="./leave-modal.scss"></style>
<script lang="ts" src="./leave-modal.ts"></script>