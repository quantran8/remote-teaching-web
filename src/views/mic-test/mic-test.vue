<template>
  <Modal :visible="true" :closable="false" :centered="true" :maskClosable="false" :footer="null">
    Chọn các thứ ở đây
    <Row type="flex" justify="end">
      <Button class="btn-cancel-policy" @click="cancel">Cancel</Button>
      <Button type="primary" @click="joinSession">Join session</Button>
    </Row>
  </Modal>
</template>

<style lang="scss" src="./mic-test.scss" scoped></style>
<script lang="ts" src="./mic-test.ts"></script>
