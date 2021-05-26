<template>
  <div class="calendar-page">
    <div class="calendar-title mt-40">
      <h2>Calendar</h2>
    </div>
    <div class="select-container">
      <span class="title-select">Class</span>
      <Select defaultValue="1" class="size-select">
        <Option value="1">All</Option>
      </Select>
      <span class="title-select ml-20">Group</span>
      <Select defaultValue="1" class="size-select">
        <Option value="1">All</Option>
      </Select>
    </div>
    <Calendar class="calendar" mode="month" @select="onSelect">
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
        <ul class="events">
          <li v-for="item in getListData(value)" :key="item.content">
            <p>{{ item.content }}</p>
          </li>
        </ul>
      </template>
    </Calendar>
  </div>
</template>
<style lang="scss" scoped src="./teacher-calendar.scss"></style>
<script lang="ts" src="./teacher-calendar.ts"></script>
