<template>
  <DropdownHelper v-if="displayedHelpMenu.length">
    <HeaderMenuItem
        :show-dropdown-trigger="true"
        title="Help"
        icon="help_center"
    />
    <template #popup>
      <DropdownItem
          v-for="(item, index) in displayedHelpMenu"
          :key="index"
          :text="fmtMsg(item.textLocaleId)"
          :url="item.url"
          :is-external-url="true"
          :style="{color: item.color}"
      />
    </template>
  </DropdownHelper>
</template>

<script src="./help-menu.ts" lang="ts"></script>
