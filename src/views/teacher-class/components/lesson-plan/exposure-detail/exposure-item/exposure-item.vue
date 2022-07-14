<template>
  <div :class="['item-container']">
    <Empty v-if="hasZeroImage" imageStyle="max-height: 40px" />
    <div :class="['item-content nice-scroll', isContent && 'content-block']">
      <div
        v-for="(item, index) in items"
        @click="() => onClickItem(item)"
        class="item-media"
        :key="item.id"
        :class="{ 'item-active': item.id === currentExposureItemMedia?.id, 'content-block': isContent }"
      >
        <Tooltip placement="topLeft" :overlayStyle="{ maxWidth: '400px'}">
          <template v-if="isTeaching" #title>
            <span v-html="item?.teachingContent"></span>
          </template>
          <CropImage
            v-if="item.image.metaData && item.image.metaData.width > 0 && item.image.metaData.height > 0"
            :imageUrl="item.image.url"
            :metadata="item.image.metaData"
            class="media-image"
          />
          <img v-else 
			class="media-image"
		  	:src="item.image.url" 
		 	:style="[item.image.metaData ?{
				'transform':`scale(${item.image.metaData.scaleX},${item.image.metaData.scaleY}) rotate(${item.image.metaData.rotate}deg)`,
				// if img is rotated, width equal to height of the parent div
				 'width':(item.image.metaData &&item.image.metaData.rotate) ? '100px' : '100%'
				}:'']" 
		  />
          <div v-if="items.length > 1" class="item-tag">{{ index + 1 }}</div>
        </Tooltip>
        <!-- <Tooltip v-else placement="topRight">
          <template #title>
            <span>{{ item?.teachingContent }}</span>
          </template>
          <img :src="item.image.url" class="media-image" />
          <div v-if="items.length > 1" class="item-tag">{{ index + 1 }}</div>
        </Tooltip> -->
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./exposure-item.scss"></style>
<script lang="ts" src="./exposure-item.ts"></script>
