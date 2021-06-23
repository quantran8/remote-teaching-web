<template>
  <Modal :visible="visible" :closable="false" :centered="true" :maskClosable="false" :footer="null">
    <p class="modal-title">Select unit & lesson</p>
    <div class="select-container">
      <span class="title-select">Unit</span>
      <Select :value="selectedUnit" class="size-select" @change="handleChangeUnit">
        <Option v-for="val in unit" :key="val.id">
          {{ val.number }}
        </Option>
      </Select>
      <span class="title-select ml-20">Lesson</span>
      <Select :value="selectedLesson" class="size-select" @change="handleChangeLesson">
        <Option v-for="val in lesson" :key="val.id">
          {{ val.number }}
        </Option>
      </Select>
    </div>
    <Row type="flex" justify="end">
      <Button class="btn-cancel-policy" @click="cancel">Cancel</Button>
      <Button class="ml-10" type="primary" @click="joinSession">Join session</Button>
    </Row>
  </Modal>
</template>

<style lang="scss" src="./mic-test.scss" scoped></style>
<script lang="ts" src="./mic-test.ts"></script>
