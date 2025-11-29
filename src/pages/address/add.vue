<template>
  <view v-if="!loading" class="form-container">
    <view class="form-item">
      <text>收货人</text>
      <input v-model="formData.name" placeholder="请输入收货人姓名" />
    </view>

    <view class="form-item">
      <text>手机号码</text>
      <input v-model="formData.mobile" type="number" placeholder="请输入手机号码" maxlength="11" />
    </view>

    <view class="form-item">
      <text>所在地区</text>
      <picker mode="region" @change="onRegionChange" :value="regionValue">
        <view class="picker-container">
          <text v-if="regionText" class="picker-text">{{ regionText }}</text>
          <text v-else class="picker-placeholder">请选择所在地区</text>
        </view>
      </picker>
    </view>

    <view class="form-item">
      <text>详细地址</text>
      <input v-model="formData.address_detail" placeholder="请输入详细地址（如街道、门牌号等）" />
    </view>

    <view class="form-item">
      <text>是否默认</text>
      <switch :checked="formData.is_default" @change="onDefaultChange" />
    </view>

    <view
      class="sub-btn"
      :class="{ disabled: formLoading }"
      :disabled="formLoading"
      @click="handleSubmit"
      >{{ formLoading ? '提交中...' : '提交' }}</view
    >

    <!-- 成功提示弹窗 -->
    <view v-if="showSuccessModal" class="modal-overlay">
      <view class="modal-content">
        <view class="modal-body">
          <text class="success-icon">✓</text>
          <text class="success-text">保存成功</text>
        </view>
        <view class="modal-footer">
          <view @click="closeSuccessModal" class="confirm-btn">确定</view>
        </view>
      </view>
    </view>
  </view>

  <view v-if="loading" :style="`width: 100%;height: ${windowHeight}px;`" class="loading-container">
    <image class="loading-img" :src="loadingImg" mode="widthFix"></image>
  </view>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { addAddressAPI, getAddressAPI, updateAddressAPI } from '../../api/address';
  import { onLoad } from '@dcloudio/uni-app';
  import loadingImg from '../../static/13395852403014388.gif';

  const windowHeight = uni.getSystemInfoSync().windowHeight;
  const formData = ref({
    name: '',
    mobile: '',
    province: '',
    city: '',
    area: '',
    address_detail: '',
    is_default: false,
  });

  const showSuccessModal = ref(false);
  const loading = ref(false);
  const formLoading = ref(false);
  const id = ref(null);

  // 省市区选择器的显示值
  const regionValue = computed(() => {
    if (formData.value.province && formData.value.city && formData.value.area) {
      return [formData.value.province, formData.value.city, formData.value.area];
    }
    return [];
  });

  const regionText = computed(() => {
    if (formData.value.province && formData.value.city && formData.value.area) {
      return `${formData.value.province} ${formData.value.city} ${formData.value.area}`;
    }
    return '';
  });

  const onRegionChange = (e) => {
    const [province, city, area] = e.detail.value;
    formData.value.province = province;
    formData.value.city = city;
    formData.value.area = area;
  };

  const onDefaultChange = (e) => {
    formData.value.is_default = e.detail.value;
  };

  const closeSuccessModal = () => {
    showSuccessModal.value = false;
    uni.navigateBack();
  };

  const handleSubmit = async () => {
    if (formLoading.value) return;

    // 校验
    if (!formData.value.name) {
      uni.showToast({ title: '收货人不能为空', icon: 'none' });
      return;
    }
    if (!formData.value.mobile) {
      uni.showToast({ title: '手机号码不能为空', icon: 'none' });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(formData.value.mobile)) {
      uni.showToast({ title: '手机号码格式不正确', icon: 'none' });
      return;
    }
    if (!formData.value.province || !formData.value.city || !formData.value.area) {
      uni.showToast({ title: '请选择所在地区', icon: 'none' });
      return;
    }
    if (!formData.value.address_detail) {
      uni.showToast({ title: '详细地址不能为空', icon: 'none' });
      return;
    }

    const params = JSON.parse(JSON.stringify(formData.value));
    if (id.value) {
      params._id = id.value; // 确保带上ID
      await putForm(params);
    } else {
      await postForm(params);
    }
  };

  const postForm = async (params) => {
    formLoading.value = true;
    try {
      uni.showLoading({ title: '提交中' });
      const { code, data } = await addAddressAPI(params);
      if (code === 2000) {
        showSuccessModal.value = true;
      } else {
        uni.showToast({ title: data?.msg || '添加失败', icon: 'none' });
      }
    } catch (e) {
      console.error(e);
      uni.showToast({ title: '添加失败', icon: 'none' });
    } finally {
      formLoading.value = false;
      uni.hideLoading();
    }
  };

  const putForm = async (params) => {
    formLoading.value = true;
    try {
      uni.showLoading({ title: '提交中' });
      const { code, data } = await updateAddressAPI(params);
      if (code === 2000) {
        showSuccessModal.value = true;
      } else {
        uni.showToast({ title: data?.msg || '修改失败', icon: 'none' });
      }
    } catch (e) {
      console.error(e);
      uni.showToast({ title: '修改失败', icon: 'none' });
    } finally {
      formLoading.value = false;
      uni.hideLoading();
    }
  };

  const getAddress = async (addressId) => {
    loading.value = true;
    try {
      const { data } = await getAddressAPI(addressId);
      if (data) {
        formData.value = {
            ...data,
            is_default: !!data.is_default // 确保是 boolean
        };
      }
    } catch (e) {
      console.error(e);
      uni.showToast({ title: '获取地址详情失败', icon: 'none' });
    } finally {
      loading.value = false;
    }
  };

  onLoad((options) => {
    if (options.id) {
      id.value = options.id;
      getAddress(options.id);
    }
  });
</script>

<style scoped lang="less">
  .form-container {
    padding: 40rpx;
    width: 100%;
    .form-item {
      margin-bottom: 40rpx;
      box-sizing: border-box;
      text {
        display: block;
        margin-bottom: 16rpx;
      }

      input {
        width: 100%;
        height: 80rpx;
        padding: 0 20rpx;
        border: 1px solid #ddd;
        border-radius: 8rpx;
        box-sizing: border-box;
      }

      .picker-container {
        width: 100%;
        height: 80rpx;
        padding: 0 20rpx;
        border: 1px solid #ddd;
        border-radius: 8rpx;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        cursor: pointer;
        .picker-text {
          color: #333;
          font-size: 32rpx;
          padding-top: 10rpx;
        }

        .picker-placeholder {
          color: #999;
          font-size: 28rpx;
        }
      }
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }

  .modal-content {
    background-color: #fff;
    border-radius: 16rpx;
    width: 80%;
    max-width: 600rpx;
    padding: 40rpx;
  }

  .modal-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx 0;
  }

  .success-icon {
    font-size: 80rpx;
    color: #07c160;
    margin-bottom: 20rpx;
  }

  .success-text {
    font-size: 32rpx;
    color: #333;
  }

  .modal-footer {
    margin-top: 40rpx;
    text-align: center;
  }

  .confirm-btn {
    background: linear-gradient(to right, #d8d9ff, #e0e0fb, #f5ebf2, #fdeeec, #fdeeec);
    color: #333;
    border: none;
    border-radius: 8rpx;
    padding: 20rpx 40rpx;
    font-size: 28rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sub-btn {
    background: linear-gradient(to right, #d8d9ff, #e0e0fb, #f5ebf2, #fdeeec, #fdeeec);
    color: #333;
    border: none;
    border-radius: 8rpx;
    padding: 28rpx 40rpx;
    font-size: 28rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20rpx 0 rgba(0, 0, 0, 0.1);
  }
  .sub-btn.disabled {
    opacity: 0.6;
    pointer-events: none;
  }
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    .loading-img {
      width: 80%;
    }
  }
</style>
