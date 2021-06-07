<template>
  <div class="calendar-page">
    <div class="calendar-title mt-20">
      <h2>Calendar</h2>
    </div>
    <div class="select-container">
      <span class="title-select">Class</span>
      <Select :value="selectedClassId" class="size-select" @change="handleChangeClass">
        <Option value="all">All</Option>
        <Option v-for="val in listClassSelect" :key="val.id">
          {{ val.name }}
        </Option>
      </Select>
      <span class="title-select ml-20">Group</span>
      <Select :value="selectedGroupId" :disabled="isDisableGroup" class="size-select" @change="handleChangeGroup">
        <Option value="all">All</Option>
        <Option v-for="val in listGroupSelect" :key="val.id">
          {{ val.name }}
        </Option>
      </Select>
      <div class="loading" v-if="loading">
        <Spin></Spin>
      </div>
    </div>
    <Calendar class="calendar" mode="month" @panelChange="onPanelChange">
      <template #headerRender="{ value, onChange }">
        <div style="padding: 10px; float: right; margin-bottom: 20px;">
          <Row type="flex">
            <a-col>
              <Select
                :dropdown-match-select-width="false"
                class="year-select"
                :value="String(value.year())"
                @change="
                  newYear => {
                    onChange(value.clone().year(newYear));
                  }
                "
              >
                <Option v-for="val in getYears(value)" :key="String(val)">
                  {{ val }}
                </Option>
              </Select>
            </a-col>
            <a-col>
              <Select
                :dropdown-match-select-width="false"
                class="month-select"
                :value="String(value.month())"
                @change="
                  selectedMonth => {
                    onChange(value.clone().month(parseInt(selectedMonth, 10)));
                  }
                "
              >
                <Option v-for="(val, index) in getMonths(value)" :key="String(index)">
                  {{ val }}
                </Option>
              </Select>
            </a-col>
          </Row>
        </div>
      </template>
      <template #dateCellRender="{ current: value }">
        <div @click="canCreate(value) && scheduleAction('Create', value)" :style="`min-width: 100%; min-height: 100%`">
          <div v-for="item in getListData(value)" :key="item.customizedScheduleId" :style="`color: ${item.color}; font-weight: 500`">
            <a @click.stop.prevent="isUpdate(item) ? scheduleAction('Update', value, item) : scheduleAction('Other', value, item)"
              >{{ item.className }} <br />
              {{
                `Group ${item.groupName}: ${item.start ? `${item.start.split(":")[0]}:${item.start.split(":")[1]}` : ""}${
                  item.end ? ` - ${item.end.split(":")[0]}:${item.end.split(":")[1]}` : ""
                }`
              }}
            </a>
            <br />
            <br />
          </div>
        </div>
      </template>
    </Calendar>
    <Modal :visible="visible" title="Schedule New Remote Session" :closable="false" :centered="true" :maskClosable="false" :footer="null">
      <div class="select-container" v-if="isCreate">
        <span class="modal-title-select">Class</span>
        <Select :value="selectedClassIdModal" class="modal-size-group" @change="handleChangeClassModal">
          <Option v-for="val in listClassSelect" :key="val.id">
            {{ val.name }}
          </Option>
        </Select>
      </div>
      <div class="select-container">
        <span class="modal-title-select">Group</span>
        <Select :value="selectedGroupIdModal" class="modal-size-group" @change="handleChangeGroupModal">
          <Option v-for="val in listGroupModal" :key="val.id">
            {{ val.name }}
          </Option>
        </Select>
      </div>
      <div class="select-container">
        <span class="modal-title-select">Start</span>
        <TimePicker class="modal-size-time-picker" @change="onChangeStartDateModal" :value="moment(selectedStartDateModal, 'HH:mm')" format="HH:mm" />
        <span class="modal-title-select ml-20">End</span>
        <TimePicker
          class="modal-size-time-picker"
          :disabled="disableEndTime(selectedStartDateModal)"
          :disabledHours="getDisabledHoursEnd"
          :disabledMinutes="getDisabledMinutesEnd"
          @change="onChangeEndDateModal"
          :value="moment(selectedEndDateModal, 'HH:mm')"
          format="HH:mm"
        />
      </div>
      <div class="modal-footer">
        <div class="delete-position">
          <Button v-if="!isCreate" type="danger" @click="onSubmit('Delete')">Delete</Button>
        </div>
        <div class="save-position">
          <Button class="btn-cancel" @click="onCancel">Cancel</Button>
          <Button type="primary" @click="onSubmit(isCreate ? 'Create' : 'Update')">Save</Button>
        </div>
      </div>
    </Modal>
    <Modal :visible="recurringVisible" title="Schedule New Remote Session" :closable="false" :centered="true" :maskClosable="false" :footer="null">
      <div class="select-container">
        <span class="modal-title-select">Group</span>
        <Select :value="selectedGroupIdModal" class="modal-size-group" @change="handleChangeGroupModal">
          <Option v-for="val in listGroupModal" :key="val.id">
            {{ val.name }}
          </Option>
        </Select>
      </div>
      <div class="select-container">
        <span class="modal-title-select">Start</span>
        <TimePicker class="modal-size-time-picker" disabled :value="moment(selectedStartDateModal, 'HH:mm')" format="HH:mm" />
      </div>
      <div class="select-container">
        <span class="modal-title-select">End</span>
        <TimePicker class="modal-size-time-picker" disabled :value="moment(selectedEndDateModal, 'HH:mm')" format="HH:mm" />
      </div>
      <p class="note">Note: This is a recurring schedule managed from <a>school</a>.</p>
      <div class="modal-footer">
        <div class="delete-position">
          <Button type="primary" @click="onSubmit('Skip')">Skip</Button>
        </div>
        <div class="save-position">
          <Button class="btn-cancel" @click="onCancel">Close</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>
<style lang="scss" scoped src="./teacher-calendar.scss"></style>
<script lang="ts" src="./teacher-calendar.ts"></script>
