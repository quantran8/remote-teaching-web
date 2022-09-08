<template>
  <div class="change-lesson">
    <Modal
      :style="{ top: '5%' }"
      class="change-lesson__modal"
      v-model:visible="visible"
      :title="SetLessonAndUnit"
      width="700px"
      :footer="null"
      :maskClosable="!preventCloseModal"
      :closable="!preventCloseModal"
    >
      <Row align="middle" class="change-lesson__mb--default">
        <div class="ant-col-24 ant-col-sm-6">
          <b>{{ LessonUnit }}</b>
        </div>
        <div class="ant-col-24 ant-col-sm-18">
          <Space size="large" align="center">
            <Space size="small" align="center">
              <label>{{ Unit }}</label>
              <Select v-model:value="currentUnit" class="change-lesson__unit-lesson" ref="select" @change="handleUnitChange">
                <SelectOption v-for="item in unitInfo" :key="item.unit" :value="item.unit">{{ item.unit }}</SelectOption>
              </Select>
            </Space>
            <Space size="small" align="center">
              <label>{{ Lesson }}</label>
              <Select v-model:value="currentLesson" class="change-lesson__unit-lesson" ref="select" @change="handleLessonChange">
                <SelectOption v-for="lesson in listLessonByUnit" :key="lesson" :value="lesson">{{ lesson }}</SelectOption>
              </Select>
            </Space>
          </Space>
        </div>
      </Row>
      <Row type="flex" justify="end" class="change-lesson__mb--small">
        <Space size="large" align="center">
          <Button width="100px" @click="handleCancel">{{ Cancel }}</Button>
          <Button
            :disabled="!currentLesson || !currentUnit || classInfo.lesson === currentLesson && classInfo.unit === currentUnit"
            width="100px"
            @click="handleSubmit"
            type="primary"
            :loading="loading"
          >
            {{ Ok }}
          </Button>
        </Space>
      </Row>
      <Row type="flex" justify="center">
        <span class="change-lesson__mess-teacher-error">{{ messageUpdateLessonAndUnit }}</span>
      </Row>
    </Modal>
  </div>
</template>
<style lang="scss" scoped src="./change-lesson-unit.scss"></style>
<script lang="ts" src="./change-lesson-unit.ts"></script>