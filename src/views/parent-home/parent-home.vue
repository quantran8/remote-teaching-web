<template>
  <div class="student-page" v-if="policy">
    <h2>{{ welcomeText }} {{ username }}</h2>
    <p>{{ chooseStudentText }}</p>
    <hr />
    <div class="list-student">
      <StudentCard
        v-for="child in children"
        :key="child.id"
        :nextSessionInfo="studentNextSessionInfo(child.id)"
        :name="formatName(child.englishName, child.name)"
        :avatar="child.avatar"
        @click="() => onClickChild(child)"
      >
      </StudentCard>
    </div>
    <DeviceTester
      :fromParentComponent="true"
      :getRoomInfoError="getRoomInfoError"
      :getRoomInfoErrorByMsg="getRoomInfoErrorByMsg"
      :studentVideoMirror="studentVideoMirror"
      @go-to-class="goToClass"
      :classIsActive="classIsActive"
      ref="deviceTesterRef"
      @on-close-modal="onDevicesModalClose"
    />
  </div>
  <Modal :visible="visible && !policy" :closable="false" :centered="true" :maskClosable="false" :footer="null">
    <h3>{{ policyTitleModal }}</h3>
    <p>{{ readPolicy }}</p>
    <hr />
    <div class="policy-content">
      <p>
        <b>{{ policyTitle }}</b>
        <br />{{ policySubtitle }}
      </p>
      <p>{{ policyText1 }}</p>
      <p>{{ policyText2 }}</p>
      <p>{{ policyText3 }}</p>
      <p>{{ policyText4 }}</p>
    </div>
    <Checkbox @change="onAgreePolicy">{{ acceptPolicyText }}</Checkbox>
    <Row type="flex" justify="end">
      <Button class="btn-cancel-policy" @click="cancelPolicy">{{ cancelText }}</Button>
      <Button :disabled="!agreePolicy" type="primary" @click="submitPolicy">{{ submitText }}</Button>
    </Row>
  </Modal>
</template>

<style lang="scss" scoped src="./parent-home.scss"></style>
<script lang="ts" src="./parent-home.ts"></script>
