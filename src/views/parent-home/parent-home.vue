<template>
  <div class="student-page" v-if="policy">
    <h2>Welcome {{ username }}</h2>
    <p>Choose a student to start</p>
    <hr />
    <div class="list-student">
      <StudentCard v-for="child in children" :key="child.id" :name="child.name" @click="() => onClickChild(child)"> </StudentCard>
    </div>
  </div>
  <h1 class="access-denied" v-if="!visible && !policy">Access Denied</h1>
  <Modal :visible="visible && !policy" title="Privacy Policy" :closable="false" :centered="true" :maskClosable="false" :footer="null">
    <div class="policy-content">
      <p>{{ policyText1 }}</p>
      <p>{{ policyText2 }}</p>
      <p>{{ policyText3 }}</p>
      <p>{{ policyText4 }}</p>
      <Checkbox @change="onAgreePolicy">I accept the policies</Checkbox>
    </div>
    <Row type="flex" justify="end">
      <Button class="btn-cancel-policy" @click="cancelPolicy">Cancel</Button>
      <Button :disabled="!agreePolicy" type="primary" @click="submitPolicy">Submit</Button>
    </Row>
  </Modal>
</template>

<style lang="scss" scoped src="./parent-home.scss"></style>
<script lang="ts" src="./parent-home.ts"></script>
