
<template>
	<div class="schedule">
	 <div class="schedule__header">
		<p>{{ dateTime }}</p>
	 </div>
	<div class="schedule__info">
		<div class="session__wrapper">
			<div class="session__container">
				<div v-for="(item,index) of selectItem" :key="index" class="session__info">
					<div :class="['session__info__item', (item.customizedScheduleType === ScheduleType.Cancelled) && 'session__info__item--skipped', (item.customizedScheduleType === ScheduleType.Create) && 'text__main__color']">
						<p class="class__title">{{item.className}}</p>
						<p class="schedule__info__title"> {{groupText}} {{item.groupName}} *</p>
						<p class="schedule__info__title">{{`${item.start ? `${item.start.split(":")[0]}:${item.start.split(":")[1]}` : ""}${item.end ? ` - ${item.end.split(":")[0]}:${item.end.split(":")[1]}` : ""}`}}</p>
					</div>
					<div class="action">
						<button :class="['btn__action', 'btn__action--md', disabledSkipOrDeleteBtn && 'btn__action--disable btn__action--not__allowed', (item.customizedScheduleType === ScheduleType.Cancelled) && 'btn__action--disable']" :disabled="disabledSkipOrDeleteBtn" @click="deleteOrSkipSchedule(item)">
							<img src="@/assets/icons/close_white.png" class="close-icon"/>
							<span>{{actionText(item)}}</span>
						</button>
					</div>
				</div>
			</div>
			<div class="bottom__note">
				<p>* {{bottomNoteText}}</p>
			</div>
		</div>
		<div class="session__control">
			<p class="schedule__remote">{{newSessionText}}</p>
			<div class="select__container">
			<span class="title__select schedule__info__title">{{ classText }}:</span>
			<div class="select__item">
				<Select :show-arrow="false" class="select__item__options" :value="currentClass" @change="handleChangeClass">
				<Option class="ant-custom-calendar" v-for="val in classGroup" :key="val.classId">
					{{ val.className }}
				</Option>
				</Select>
			</div>
		</div>
		<div class="select__container">
			<span class="title__select schedule__info__title">{{ groupText }}:</span>
			<div class="select__item">
				<Select :show-arrow="false" class="select__item__options" :value="listGroupByClass[0]?.groupName" @change="handleChangeGroup" >
				<Option class="ant-custom-calendar" v-for="val in listGroupByClass" :key="val.groupId">
					{{ val.groupName }}
				</Option>
				</Select>
			</div>
		</div>
		<p>{{enterTimeText}}:</p>
		<div class="select__container select__time__container">
			<span class="title__select">{{ startTimeText }}</span>
			<div class="flex__container">
				<div class="select__time">
					<div class="select__time__item">
						<Select :value="selectStartHour" :show-arrow="false" style="width:50px;" @change="onChangeHourStart">
						<Option v-for=" number in 12" :key="number" :disabled = "isDisableHour(number)">
							{{number < 10 ? "0" + number : number }}
						</Option>
					</Select>
					<span>{{hourText}}</span>
					</div>
					<div class="select__time__item">
						<Select :value="selectStartMinutes" :show-arrow="false" style="width:50px" @change="onChangeMinutesStart">
						<Option v-for=" (number,index) in 60" :key="number" :disabled = "isDisableMinutes(index)">
							{{index < 10 ? "0" + index : index}}
						</Option>
					</Select>
					<span>{{minuteText}}</span>
					</div>
				</div>
				<RadioGroup :value="startHourType" @change="onChangeStartHourType" size="small">
					<RadioButton class="radio__button" :value="HourType.AM">AM</RadioButton>
					<RadioButton class="radio__button" :value="HourType.PM">PM</RadioButton>
				</RadioGroup>
			</div>
			<span class="title__select">{{ endTimeText }}</span>
			<div class=" flex__container">
				<div class="select__time">
					<div class="select__time__item">
					<Select :value="selectEndHour" :show-arrow="false" style="width:50px;" @change="onChangeHourEnd">
						<Option v-for=" number in 12" :key="number" :disabled = "isDisableHourEnd(number)">
							{{number < 10 ? "0" + number : number }}
						</Option>
					</Select>
					<span>{{hourText}}</span>
				</div>
				<div class="select__time__item">
					<Select :value="selectEndMinutes" :show-arrow="false" style="width:50px;" @change="onChangeMinutesEnd">
						<Option v-for=" (number,index) in 60" :key="number" :disabled = "isDisableMinutesEnd(index)">
							{{index < 10 ? "0" + index : index}}
						</Option>
					</Select>
					<span>{{minuteText}}</span>
				</div>
				</div>
				<RadioGroup :value="endHourType" @change="onChangeEndHourType" size="small">
					<RadioButton class="radio__button" :value="HourType.AM">AM</RadioButton>
					<RadioButton class="radio__button" :value="HourType.PM">PM</RadioButton>
				</RadioGroup>
			</div>
		</div>
		<div>
			<p class="text__main__color">* {{nonRecurringText}}</p>
			<button :class="['btn__action','btn__action--lg',(disabledSkipOrDeleteBtn || disabledAddSessionBtn) && 'btn__action--disable btn__action--not__allowed']" :disabled="disabledAddSessionBtn" @click="createSchedule">
				<img src="@/assets/icons/add.png" class="close-icon"/>
				<span class="schedule__info__title">{{addSessionText}}</span>
			</button>
		</div>
		</div>
	</div>
	</div>	
</template>
<style lang="scss" scoped src="./schedule-info.scss"></style>
<script lang="ts" src="./schedule-info.ts"></script>
