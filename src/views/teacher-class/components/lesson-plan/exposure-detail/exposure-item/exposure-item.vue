<template>
  <div :class="['item-container']" v-if="!isAlternateMedia">
    <Empty v-if="hasZeroImage" imageStyle="max-height: 40px" />
    <div :class="['item-content nice-scroll', isContent && 'content-block',isAlternateMedia && 'alternate-block']">
      <div
        v-for="(item, index) in items"
        @click="() => onClickItem(item)"
        class="item-media"
        :key="item.id"
        :class="{ 'item-active': item.id === currentExposureItemMedia?.id, 'content-block': isContent,'alternate-block' : isAlternateMedia}"
      >
        <Tooltip placement="rightBottom" :overlayStyle="{ maxWidth: '400px'}">
          <template v-if="isTeaching" #title>
            <span v-html="item?.teachingContent"></span>
          </template>
			<img v-if="item.image.metaData && item.image.metaData.annotations.length" src="@/assets/icons/bullseye.png" class="target-image"/>
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
				 'width':(item.image.metaData &&item.image.metaData.rotate && (Math.abs(item.image.metaData.rotate) === 270 || Math.abs(item.image.metaData.rotate)=== 90)) ? '100px' : '100%'
				}:'']" 
		  />
          <div v-if="items.length > 1 || item.teacherUseOnly" :class="['item-tag', item.teacherUseOnly ? 'item-tag__teacher-use-only' : '']">{{ index + 1 }}</div>
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

  <div :class="['item-container']" v-else>
    <Empty v-if="hasZeroImage" imageStyle="max-height: 40px" />
    <div :class="['item-content-alternate-media','nice-scroll', isContent && 'content-block',isAlternateMedia && 'alternate-block']">
	        
      <div v-for="(slide, i) in items" :key="i" class="item-alternate-media" >
      	<div
	        v-for="(item, index) in slide"
	        @click="() => onClickItem(item)"
	        class="item-media"
	        :key="item.id"
	        :class="{ 'item-active': item.id === currentExposureItemMedia?.id, 'content-block': isContent,'alternate-block' : isAlternateMedia}"
	    >
		  <div v-if="item.mediaTypeId === undefined">
			<Tooltip placement="rightBottom" :overlayStyle="{ maxWidth: '400px'}">
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
			  		'width':(item.image.metaData &&item.image.metaData.rotate && (Math.abs(item.image.metaData.rotate) === 270 || Math.abs(item.image.metaData.rotate)=== 90)) ? '100px' : '100%'
			  	}:'']" 
			  />
			</Tooltip>
	      </div>
		    <div v-else-if="item.mediaTypeId === 1" class="media-wrapper">
	
				<img :src="IconPdf" class="media-icon"/>
			  
		    </div>
		    <div v-else-if="item.mediaTypeId === 2" class="media-wrapper">
			
			    <img :src="IconAudio" class="media-icon"/>
			 
		    </div>
		    <div v-else class="media-wrapper">
			
  			    <img :src="IconVideo" class="media-icon"/>
			
		    </div>
	        <div v-if="items.length > 1 || item.teacherUseOnly" :class="['item-tag', item.teacherUseOnly ? 'item-tag__teacher-use-only' : '']">{{ index + 1 }}</div>
	    </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./exposure-item.scss"></style>
<script lang="ts" src="./exposure-item.ts"></script>
