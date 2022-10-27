<template>
	<div class="container">
		<!-- <div v-if="isShowImageModal" style="position: absolute;z-index:10">
			<div class="overlay"></div>
			<Carousel ref="myCarousel" :items-to-show="1" snapAlign="center">
				<Slide v-for="(item,index) in carouselDataSource" :key="index">
					<img src="@/assets/images/trash.png" @click="() => deleteImage(index)" class="remove_icon">
					<img :src="blobNameToUrl(item.blobName)" />
				</Slide>
				<template #addons>
					<navigation />
					<pagination />
				</template>
			</Carousel>
		</div> -->
		
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
						<img class="calendar_icon" src="@/assets/images/calendar.png" @click="showCalendar" />
						<Input placeholder=" " v-model:value="filterOptions.date" style="height: 32px;"/>
						<Calendar v-if="isShowCalendar" v-model:value="currentDate" :fullscreen="false" @panelChange="handleChangeDate"
							@select="handleChangeDate" class="calendar"/>
					</div>

					<div class="select_item">
						<span class="label">School</span>
						<Select class="select_box" label-in-value v-model:value="schoolOptions[0]" @change="handleChangeSchool"
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
			<Modal  v-model:visible="isShowImageModal" width="800px">
				<Carousel ref="myCarousel" :items-to-show="1" snapAlign="center">
					<Slide v-for="(item,index) in carouselDataSource" :key="index">
						<img src="@/assets/images/trash.png" @click="() => removeImage(item.blobName)" class="remove_icon">
						<img :src="blobNameToUrl(item.blobName)" />
					</Slide>
					<template #addons>
						<navigation />
						<pagination />
					</template>
				</Carousel>
			</Modal>
	</div>
</template>
<style lang="scss" scoped src="./teacher-image-view.scss"></style>
<script lang="ts" src="./teacher-image-view.ts"></script>