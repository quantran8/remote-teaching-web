<template>
  <div class="calendar-page">
    <div class="calendar-title mt-20">
      <h2>{{ titleText }}</h2>
    </div>
    <div class="control-container">
      <div class="select-container">
        <span class="title-select">{{ classText }}</span>
        <Select :value="selectedClassId" class="size-select ant-custom-calendar" @change="handleChangeClass">
          <Option class="ant-custom-calendar" value="all">{{ allText }}</Option>
          <Option class="ant-custom-calendar" v-for="val in listClassSelect" :key="val.id">
            {{ val.name }}
          </Option>
        </Select>
        <span class="title-select ml-20">{{ groupText }}</span>
        <Select :value="selectedGroupId" :disabled="isDisableGroup" class="size-select ant-custom-calendar" @change="handleChangeGroup">
          <Option class="ant-custom-calendar" value="all">{{ allText }}</Option>
          <Option class="ant-custom-calendar" v-for="val in listGroupSelect" :key="val.id">
            {{ val.name }}
          </Option>
        </Select>
      </div>
      <BaseButton mode="clear" class="icon back-btn" @click="onClickBack">
        <BaseIcon name="icon-back"></BaseIcon>
        <span>{{ backText }}</span>
      </BaseButton>
    </div>
    <div class="loading-center" v-if="loading">
      <Spin class="ant-custom-calendar"></Spin>
    </div>
    <Calendar class="calendar" mode="month" @panelChange="onPanelChange">
      <template #headerRender="{ value, onChange }">
        <div style="padding: 10px; float: right; margin-bottom: 20px">
          <Row type="flex">
            <a-col>
              <Select
                :dropdown-match-select-width="false"
                class="year-select ant-custom-calendar"
                :value="String(value.year())"
                @change="
                  (newYear) => {
                    onChange(value.clone().year(newYear));
                  }
                "
              >
                <Option class="ant-custom-calendar" v-for="val in getYears(value)" :key="String(val)">
                  {{ val }}
                </Option>
              </Select>
            </a-col>
            <a-col>
              <Select
                :dropdown-match-select-width="false"
                class="month-select ant-custom-calendar"
                :value="String(value.month())"
                @change="
                  (selectedMonth) => {
                    onChange(value.clone().month(parseInt(selectedMonth, 10)));
                  }
                "
              >
                <Option class="ant-custom-calendar" v-for="(val, index) in getMonths(value)" :key="String(index)">
                  {{ val }}
                </Option>
              </Select>
            </a-col>
          </Row>
        </div>
      </template>
      <template #dateCellRender="{ current: value }">
        <div @click="canCreate(value) && scheduleAction('Create', value)" :style="`min-width: 100%; min-height: 100%`">
          <div
            v-for="item in getListData(value)"
            :key="item.customizedScheduleId"
            :style="`position: 'relative'; color: ${item.color}; font-weight: 500`"
          >
            <Tooltip placement="top">
              <template #title>
                <span>{{ warningOverlap }}</span>
              </template>
              <img class="warning-icon" :src="IconWarning" v-if="checkOverlapTime(value)" />
            </Tooltip>
            <a @click.stop.prevent="isUpdate(item) ? scheduleAction('Update', value, item) : scheduleAction('Other', value, item)">
              <span class="session-info">
                <span class="session-info__class-name">{{ item.className }}</span>
                <span class="session-info__group">{{ `Group ${item.groupName}:` }}</span>
                <span>
                  {{
                    `${item.start ? `${item.start.split(":")[0]}:${item.start.split(":")[1]}` : ""}${
                      item.end ? ` - ${item.end.split(":")[0]}:${item.end.split(":")[1]}` : ""
                    }`
                  }}
                </span>
              </span>
            </a>
            <br />
            <br />
          </div>
        </div>
        <PlusCircleOutlined class="add-icon" v-if="canShowCreate(value)" @click="canCreate(value) && scheduleAction('Create', value)" />
      </template>
    </Calendar>
    <Modal :visible="visible" title="Schedule New Remote Session" :closable="false" :centered="true" :maskClosable="false" :footer="null">
      <div class="select-container" v-if="isCreate">
        <span class="modal-title-select">{{ classText }}</span>
        <Select :value="selectedClassIdModal" class="modal-size-group ant-custom-calendar" @change="handleChangeClassModal">
          <Option class="ant-custom-calendar" v-for="val in listClassCreateNew" :key="val.id">
            {{ val.name }}
          </Option>
        </Select>
      </div>
      <div class="select-container">
        <span class="modal-title-select">{{ groupText }}</span>
        <Select :value="selectedGroupIdModal" class="modal-size-group ant-custom-calendar" @change="handleChangeGroupModal">
          <Option class="ant-custom-calendar" v-for="val in listGroupModal" :key="val.id">
            {{ val.name }}
          </Option>
        </Select>
      </div>
      <div class="select-container">
        <span class="modal-title-select">{{ startTimeText }}</span>
        <TimePicker
          class="modal-size-time-picker ant-custom-calendar"
          popupClassName="ant-custom-calendar"
          @change="onChangeStartDateModal"
          :value="moment(selectedStartDateModal, 'HH:mm')"
          format="HH:mm"
          :disabledHours="getDisableHoursStart"
          :disabledMinutes="getDisableMinutesStart"
        />
        <span class="modal-title-select ml-20">{{ endTimeText }}</span>
        <TimePicker
          class="modal-size-time-picker ant-custom-calendar"
          popupClassName="ant-custom-calendar"
          :disabledHours="getDisabledHoursEnd"
          :disabledMinutes="getDisabledMinutesEnd"
          @change="onChangeEndDateModal"
          :value="moment(selectedEndDateModal, 'HH:mm')"
          format="HH:mm"
        />
      </div>
      <div class="modal-footer">
        <div class="delete-position">
          <Button v-if="!isCreate" type="danger" @click="onSubmit('Delete')">{{ deleteText }}</Button>
        </div>
        <div class="save-position">
          <Button class="btn-cancel ant-custom-calendar" @click="onCancel">{{ cancelText }}</Button>
          <Button type="primary" class="ant-custom-calendar" @click="onSubmit(isCreate ? 'Create' : 'Update')" :disabled="onValidateTime()">{{
            saveText
          }}</Button>
        </div>
      </div>
    </Modal>
    <Modal :visible="recurringVisible" title="Schedule New Remote Session" :closable="false" :centered="true" :maskClosable="false" :footer="null">
      <div class="select-container">
        <span class="modal-title-select">{{ groupText }}</span>
        <Select :value="selectedGroupIdModal" class="modal-size-group ant-custom-calendar" @change="handleChangeGroupModal" disabled>
          <Option class="ant-custom-calendar" v-for="val in listGroupModal" :key="val.id">
            {{ val.name }}
          </Option>
        </Select>
      </div>
      <div class="select-container">
        <span class="modal-title-select" v-if="disableTimePicker()">{{ startTimeText }}</span>
        <TimePicker
          class="modal-size-time-picker ant-custom-calendar"
          popupClassName="ant-custom-calendar"
          v-if="disableTimePicker()"
          disabled
          :value="moment(selectedStartDateModal, 'HH:mm')"
          format="HH:mm"
        />
        <span class="modal-title-select ml-20" v-if="disableTimePicker()">{{ endTimeText }}</span>
        <TimePicker
          class="modal-size-time-picker ant-custom-calendar"
          popupClassName="ant-custom-calendar"
          v-if="disableTimePicker()"
          disabled
          :value="moment(selectedEndDateModal, 'HH:mm')"
          format="HH:mm"
        />
      </div>
      <p class="note">
        {{ noteText }}<a>{{ schoolText }}</a
        >.
      </p>
      <div class="modal-footer">
        <div class="delete-position">
          <Button type="primary" class="ant-custom-calendar" v-if="disableSkipButton()" @click="onSubmit('Skip')">{{ skipText }}</Button>
        </div>
        <div class="save-position">
          <Button class="btn-cancel ant-custom-calendar" @click="onCancel">{{ closeText }}</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>
<style lang="scss" scoped src="./teacher-calendar.scss"></style>
<script lang="ts" src="./teacher-calendar.ts"></script>
