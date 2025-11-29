<template>
  <view 
    class="hj-button" 
    :class="[type, { disabled: disabled }]"
    :style="customStyle"
    @click="onClick"
  >
    <slot></slot>
  </view>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'primary' // primary, secondary, danger 等
  },
  disabled: {
    type: Boolean,
    default: false
  },
  customStyle: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);

const onClick = (event) => {
  // 阻止事件冒泡
  event.stopPropagation();
  
  if (!props.disabled) {
    emit('click', event);
  }
};
</script>

<style scoped lang="less">
.hj-button {
  width: 100%;
  border: none;
  border-radius: 4px;
  padding: 14px 20px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10rpx 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-weight: bold;
  box-sizing: border-box;
  
  &.primary {
    background: linear-gradient(to right, #d8d9ff, #e0e0fb, #f5ebf2, #fdeeec, #fdeeec);
    color: #333;
  }
  
  &.secondary {
    background: #f5f5f5;
    color: #666;
  }
  
  &.danger {
    background: linear-gradient(to right, #ff4d4f, #f88284);
    color: #fff;
  }
  
  &.disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}
</style>