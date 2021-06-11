<template>
  <div class="language-picker">
    <Dropdown :trigger="['click']">
      <a class="ant-dropdown-link" @click.prevent>
        <Button class="language-picker__button" shape="round" size="large">
          <template #icon>
            <GlobalOutlined class="language-picker__button--global" />
            <span class="language-picker__button--text">{{ labelCurrentLanguage }}</span>
            <DownOutlined />
          </template>
        </Button>
      </a>
      <template #overlay>
        <Menu v-model:selectedKeys="currentLanguageCode" class="language-picker__menu">
          <MenuItem class="language-picker__menu" @click="handleClick" v-for="{ value, label } in languages" :key="value">
            <div :class="classGenerator(value)" />
            <div class="language-picker__menu--item__text">{{ label }}</div>
          </MenuItem>
        </Menu>
      </template>
    </Dropdown>
  </div>
</template>
<style lang="scss" scoped src="./language-picker.scss"></style>
<script lang="ts" src="./language-picker.ts"></script>
