<template>
	<AppHeader class="header" :title="title">
	  <template #right>
		<ResourceMenu />
		<HelpMenu />
		<LanguagePicker />
		<UserAvatar>
		  <template #extraItems>
			<DropdownItem :text="testConnectText" @click.prevent="onClickTestDevice" />
			<!-- <DropdownItem v-if="isShowWriterReview" :text="writerReviewText" @click.prevent="onClickWriterReview" /> -->
		  </template>
		</UserAvatar>
	  </template>
	  <DeviceTester :notJoin="true" ref="deviceTesterRef" />
	</AppHeader>
  </template>
  <style src="./header.scss" lang="scss" scoped></style>
  <script src="./header.ts" lang="ts"></script>
  