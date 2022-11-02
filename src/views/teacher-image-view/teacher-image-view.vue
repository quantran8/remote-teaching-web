<template>
	<div class="container">
			<div class="filter_header">
				<RadioGroup v-model:value="filterMode" @change="handleChangeRadioSelected">
					<Radio :value="FilterMode.Student">By Student</Radio>
					<Radio :value="FilterMode.Session">By Session</Radio>
				</RadioGroup>
			</div>
			<div class="filter_wrapper">
				<div v-if="filterMode === FilterMode.Student" class="filter_container student_filter">
					<div class="select_item">
						<span class="label">Class</span>
						<Select class="select_box" label-in-value v-model:value="classSelected" @change="handleChangeClass"
							:options="classOptions" />
					</div>
					<div class="select_item">
						<span class="label">Group</span>
						<Select class="select_box" label-in-value v-model:value="groupSelected" @change="handleChangeGroup"
							:options="groupOptions" />
					</div>
					<div class="select_item">
						<span class="label">Student</span>
						<Select class="select_box" label-in-value v-model:value="studentSelected" @change="handleChangeStudent"
							:options="studentOptions" />
					</div>
				</div>
				<div v-else class="filter_container session_filter">
					<div class="select_item">
						<span class="label">Date</span>
						<DatePicker v-model:value="calendarValue" placeholder=" " @change="handleChangeDate"  class="calendar"/>
						<img class="calendar_icon" src="@/assets/images/calendar.png" />
					</div>
					<div class="select_item">
						<span class="label">School</span>
						<Select class="select_box" label-in-value v-model:value="schoolSelected" @change="handleChangeSchool"
							:options="schoolOptions" />
					</div>
					<div class="select_item">
						<span class="label">Group</span>
						<Select class="select_box" label-in-value v-model:value="groupSelected" @change="handleChangeGroup"
							:options="groupOptions" />
					</div>
				</div>
				<Button @click="refreshListData">Show</Button>
			</div>
			<div>
				<Table :columns="columns" :data-source="dataSources">
					<template #count="{ record }">
					<span style="text-decoration:underline;" @click="() => handleShowImage(record)">
						<a>{{record.count}}</a>
					</span>
					</template>
				</Table>
			</div>
			<div>
					
				
			</div>
			<Modal  v-model:visible="isShowImageModal" width="720px" footer title=" ">
				<div v-if="!carouselDataSource.length" class="no_image_title"><span>No images exist</span></div>
				<Swiper
				v-else 
				:style="{
				'--swiper-navigation-color': '#fff',
				'--swiper-pagination-color': '#fff',
				}"
				:cssMode="true"
				:navigation="true"
				:pagination="{
				clickable: true,
				}"
				:mousewheel="true"
				:keyboard="true"
				:modules="modules"
				class="mySwiper">
					<SwiperSlide v-for="(item,index) in carouselDataSource" :key="index" class="slide-wrapper">
						<Popconfirm
							title="Do you want to delete this photo?"
							ok-text="Yes"
							cancel-text="No"
							@confirm="() => removeImage(item.blobName)"
						>
						<img src="@/assets/images/trash.png" class="remove_icon">
						</Popconfirm>
						<img :src="blobNameToUrl(item.blobName)" />
					</SwiperSlide>
				</Swiper>
			</Modal>
	</div>
</template>
<style lang="scss" scoped src="./teacher-image-view.scss"></style>
<script lang="ts" src="./teacher-image-view.ts"></script>