<template>
  <DropdownHelper v-if="displayedResources.length">
    <HeaderMenuItem :show-dropdown-trigger="true" title="Resources" icon="article" />
    <template #popup>
      <DropdownItem
        v-for="(resource, index) in displayedResources"
        :key="index"
        :text="fmtMsg(resource.textLocaleId)"
        :url="resource.url"
        :is-external-url="true"
        :style="{ color: resource.color }"
      />
    </template>
  </DropdownHelper>
</template>

<script src="./resource-menu.ts" lang="ts"></script>
