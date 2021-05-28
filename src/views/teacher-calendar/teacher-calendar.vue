<template>
  <div class="calendar-page">
    <div class="calendar-title mt-40">
      <h2>Calendar</h2>
    </div>
    <div class="select-container">
      <span class="title-select">Class</span>
      <Select :value="classIsChoose" class="size-select" @change="handleChangeClass">
        <Option value="all">All</Option>
        <Option v-for="val in listClassSelect" :key="val.id">
          {{ val.name }}
        </Option>
      </Select>
      <span class="title-select ml-20">Group</span>
      <Select :value="groupIsChoose" :disabled="isDisableGroup" class="size-select" @change="handeChangeGroup">
        <Option value="all">All</Option>
        <Option v-for="val in listGroupSelect" :key="val.id">
          {{ val.name }}
        </Option>
      </Select>
    </div>
    <Calendar class="calendar" mode="month" @select="onSelect" @panelChange="onPanelChange">
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
        <div v-for="item in getListData(value)" :key="item.class.name" :style="`color: ${item.color}; font-weight: 500`">
          {{ "Class: " + item.class.name }} <br />
          {{
            `Group ${item.group.name}: ${item.start ? `${item.start.split(":")[0]}:${item.start.split(":")[1]}` : ""}${
              item.end ? ` - ${item.end.split(":")[0]}:${item.end.split(":")[1]}` : ""
            }`
          }}
          <br />
          <br />
        </div>
      </template>
    </Calendar>
    <Modal :visible="visible" title="Schedule New Remote Session" :closable="false" :centered="true" :maskClosable="false" :footer="null">
      <div class="select-container">
        <span class="modal-title-select">Group</span>
        <Select defaultValue="1" class="modal-size-select">
          <Option value="1">Group 2</Option>
        </Select>
      </div>
      <div class="select-container">
        <span class="modal-title-select">Start</span>
        <Select defaultValue="1" class="modal-size-select">
          <Option value="1">13:00</Option>
        </Select>
      </div>
      <div class="select-container">
        <span class="modal-title-select">End</span>
        <Select defaultValue="1" class="modal-size-select">
          <Option value="1">14:00</Option>
        </Select>
      </div>
      <div class="modal-footer">
        <div class="delete-position">
          <Button type="danger">Delete</Button>
        </div>
        <div class="save-position">
          <Button class="btn-cancel" @click="onCancel">Cancel</Button>
          <Button type="primary">Save</Button>
        </div>
      </div>
    </Modal>
    <Modal :visible="recurringVisible" title="Schedule New Remote Session" :closable="false" :centered="true" :maskClosable="false" :footer="null">
      <div class="select-container">
        <span class="modal-title-select">Group</span>
        <Select defaultValue="1" class="modal-size-select">
          <Option value="1">Group 2</Option>
        </Select>
      </div>
      <div class="select-container">
        <span class="modal-title-select">Start</span>
        <Select defaultValue="1" disabled="true" class="modal-size-select">
          <Option value="1">13:00</Option>
        </Select>
      </div>
      <div class="select-container">
        <span class="modal-title-select">End</span>
        <Select defaultValue="1" disabled="true" class="modal-size-select">
          <Option value="1">14:00</Option>
        </Select>
      </div>
      <p class="note">Note: This is a recurring schedule managed from <a>school</a>.</p>
      <div class="modal-footer">
        <div class="delete-position">
          <Button type="primary">Skip</Button>
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
