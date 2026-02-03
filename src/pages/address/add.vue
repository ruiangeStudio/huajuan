<template xmlns="">
  <template v-if="addressBtnShow">
    <view v-if="!loading" class="form-container">
      <view class="form-item">
        <text class="label">收货人</text>
        <input v-model="formData.receiver" placeholder="请输入收货人姓名" class="form-input" />
      </view>

      <view class="form-item">
        <text class="label">手机号码</text>
        <input
          v-model="formData.phone"
          type="number"
          placeholder="请输入手机号码"
          maxlength="11"
          class="form-input"
        />
      </view>

      <view class="form-item">
        <text class="label">所在地区</text>
        <picker mode="region" @change="onRegionChange" :value="regionValue">
          <view class="picker-container">
            <text v-if="regionText" class="picker-text">{{ regionText }}</text>
            <text v-else class="picker-placeholder">请选择所在地区</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">详细地址</text>
        <input
          v-model="formData.detailAddress"
          placeholder="请输入详细地址（如街道、门牌号等）"
          class="form-input"
        />
      </view>

      <view class="form-item">
        <text class="label">贴吧昵称</text>
        <view class="picker-container" @click="openBaWuSelector">
          <text v-if="formData.tieba_name" class="picker-text">{{ formData.tieba_name }}</text>
          <text v-else class="picker-placeholder">请选择贴吧昵称</text>
        </view>
      </view>

      <view v-if="showBaWuSelector" class="selector-overlay" @click="closeBaWuSelector">
        <view class="selector-content" @click.stop>
          <view class="selector-header">
            <text class="selector-title">选择贴吧昵称</text>
            <text class="close-btn" @click="closeBaWuSelector">×</text>
          </view>
          <scroll-view scroll-y class="selector-list">
            <view
              v-for="(item, index) in baWuList"
              :key="index"
              class="selector-item"
              :class="{ active: formData.tieba_name === item.userName }"
              @click="selectBaWu(item)"
            >
              <image :src="item.avatar" class="selector-avatar" mode="aspectFill"></image>
              <view class="selector-info">
                <text class="selector-name">{{ item.userName }}</text>
                <text class="selector-role">{{ item.role }}</text>
              </view>
              <text v-if="formData.tieba_name === item.userName" class="selector-check">✓</text>
            </view>
          </scroll-view>
        </view>
      </view>

      <view class="form-item switch-item">
        <text class="label">是否默认</text>
        <switch :checked="formData.isDefault" @change="onDefaultChange" color="#07c160" />
      </view>

      <!-- 折叠面板 - 选填信息 -->
      <view class="collapse-panel">
        <view class="collapse-header" @click="toggleCollapse">
          <text class="collapse-title">选填信息</text>
          <text class="collapse-arrow" :class="{ 'arrow-rotate': !isCollapsed }">﹀</text>
        </view>
        <view class="collapse-content" v-show="!isCollapsed">
          <view class="form-item">
            <text class="label">性别</text>
            <view class="radio-group">
              <label class="radio-item">
                <radio
                  value="male"
                  :checked="formData.gender === 'male'"
                  @click="formData.gender = 'male'"
                />
                男
              </label>
              <label class="radio-item">
                <radio
                  value="female"
                  :checked="formData.gender === 'female'"
                  @click="formData.gender = 'female'"
                />
                女
              </label>
              <label class="radio-item">
                <radio
                  value="other"
                  :checked="formData.gender === 'other' || formData.gender === ''"
                  @click="formData.gender = 'other'"
                />其他
              </label>
            </view>
          </view>
        </view>
      </view>

      <!-- 使用 hj-button 组件 -->
      <hj-button :disabled="formLoading" @click="handleSubmit">
        {{ formLoading ? '提交中...' : '提交' }}
      </hj-button>

      <!-- 成功提示弹窗 -->
      <view v-if="showSuccessModal" class="modal-overlay">
        <view class="modal-content">
          <view class="modal-body">
            <text class="success-icon">✓</text>
            <text class="success-text">保存成功</text>
          </view>
          <view class="modal-footer">
            <hj-button
              @click="closeSuccessModal"
              type="primary"
              customStyle="width: auto; padding:10px 20px;"
              >确定</hj-button
            >
          </view>
        </view>
      </view>
    </view>
    <view
      v-if="loading"
      :style="`width: 100%;height: ${windowHeight}px;`"
      class="loading-container"
    >
      <image class="loading-img" :src="loadingImg" mode="widthFix"></image>
    </view>
  </template>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { addAddressAPI, getAddressAPI, updateAddressAPI } from '../../api/address';
  import { onLoad } from '@dcloudio/uni-app';
  import loadingImg from '../../static/13395852403014388.gif';
  // 导入 hj-button 组件
  import HjButton from '../../components/hj-button.vue';
  import { syncBaWuApi } from '../../api/jiuYin';
  import { getPublicAddressBtnShowAPI } from '../../api/public';

  const windowHeight = uni.getSystemInfoSync().windowHeight;
  const formData = ref({
    receiver: '',
    gender: 'other', // 默认值改为 other
    phone: '',
    province: '',
    city: '',
    district: '',
    detailAddress: '',
    isDefault: false,
    tieba_name: '',
  });

  const showSuccessModal = ref(false);
  const loading = ref(false);
  const formLoading = ref(false);
  const id = ref(null);
  const isCollapsed = ref(true); // 默认折叠
  const baWuList = ref([]);
  const showBaWuSelector = ref(false);

  // 省市区选择器的显示值
  const regionValue = computed(() => {
    if (formData.value.province && formData.value.city && formData.value.district) {
      return [formData.value.province, formData.value.city, formData.value.district];
    }
    return [];
  });

  const regionText = computed(() => {
    if (formData.value.province && formData.value.city && formData.value.district) {
      return `${formData.value.province} ${formData.value.city} ${formData.value.district}`;
    }
    return '';
  });

  const onRegionChange = (e) => {
    const [province, city, district] = e.detail.value;
    formData.value.province = province;
    formData.value.city = city;
    formData.value.district = district;
  };

  const onDefaultChange = (e) => {
    formData.value.isDefault = e.detail.value;
  };

  // 切换折叠面板
  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
  };

  const openBaWuSelector = () => {
    showBaWuSelector.value = true;
  };
  const closeBaWuSelector = () => {
    showBaWuSelector.value = false;
  };
  const selectBaWu = (item) => {
    formData.value.tieba_name = item.userName;
    closeBaWuSelector();
  };

  const closeSuccessModal = () => {
    showSuccessModal.value = false;
    uni.navigateBack();
  };

  // 表单验证规则
  const validateForm = () => {
    // 收货人验证
    if (!formData.value.receiver) {
      uni.showToast({ title: '收货人不能为空', icon: 'none' });
      return false;
    }

    // 手机号码验证
    if (!formData.value.phone) {
      uni.showToast({ title: '手机号码不能为空', icon: 'none' });
      return false;
    }

    if (!/^1[3-9]\d{9}$/.test(formData.value.phone)) {
      uni.showToast({ title: '手机号码格式不正确', icon: 'none' });
      return false;
    }

    // 地区选择验证
    if (!formData.value.province || !formData.value.city || !formData.value.district) {
      uni.showToast({ title: '请选择所在地区', icon: 'none' });
      return false;
    }

    // 详细地址验证
    if (!formData.value.detailAddress) {
      uni.showToast({ title: '详细地址不能为空', icon: 'none' });
      return false;
    }

    if (!formData.value.tieba_name) {
      uni.showToast({ title: '贴吧昵称不能为空', icon: 'none' });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (formLoading.value) return;

    // 校验表单
    if (!validateForm()) return;

    const params = { ...formData.value };
    if (id.value) {
      params._id = id.value;
      await submitAddress(params, 'update');
    } else {
      await submitAddress(params, 'add');
    }
  };

  // 统一处理地址提交（添加或更新）
  const submitAddress = async (params, action) => {
    formLoading.value = true;
    try {
      await uni.showLoading({ title: '提交中' });

      // 根据操作类型选择对应的API
      const apiMap = {
        add: addAddressAPI,
        update: updateAddressAPI,
      };

      const api = apiMap[action];
      const actionText = action === 'add' ? '添加' : '修改';
      const result = await api(params);

      if (result.code === 2000) {
        showSuccessModal.value = true;
      } else {
        await uni.showToast({
          title: result.data?.msg || `${actionText}失败`,
          icon: 'none',
        });
      }
    } catch (error) {
      console.error(`${action} address error:`, error);
      await uni.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none',
      });
    } finally {
      formLoading.value = false;
      uni.hideLoading();
    }
  };

  const getAddress = async (addressId) => {
    loading.value = true;
    try {
      const result = await getAddressAPI(addressId);
      if (result.code === 2000 && result.data) {
        formData.value = {
          ...result.data,
          isDefault: !!result.data.isDefault,
          gender: result.data.gender || 'other', // 如果没有设置性别，默认为 other
        };
      } else {
        await uni.showToast({
          title: result.data?.msg || '获取地址详情失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('Get address error:', error);
      await uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' });
    } finally {
      loading.value = false;
    }
  };

  const getBaWuList = async () => {
    try {
      const { code, data } = await syncBaWuApi();
      if (code === 2000) {
        baWuList.value = data;
      }
    } catch (error) {
      console.error('获取吧务列表失败:', error);
    }
  };

  const addressBtnShow = ref(false);
  const getPublicAddressBtnShow = async () => {
    const { data } = await getPublicAddressBtnShowAPI();
    addressBtnShow.value = data;
    if (!data) {
      uni.redirectTo({
        url: '/pages/forms/forms',
      });
    }
  };

  onLoad((options) => {
    if (options.id) {
      id.value = options.id;
      getAddress(options.id);
    }
    getBaWuList();
    getPublicAddressBtnShow();
  });
</script>

<style scoped lang="less">
  .form-container {
    padding: 40rpx;
    width: 100%;

    .form-item {
      margin-bottom: 40rpx;
      box-sizing: border-box;

      .label {
        display: block;
        margin-bottom: 16rpx;
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }

      .form-input {
        width: 100%;
        height: 80rpx;
        padding: 020rpx;
        border: 1px solid #ddd;
        border-radius: 8rpx;
        box-sizing: border-box;
        font-size: 28rpx;
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
          font-size: 28rpx;
        }

        .picker-placeholder {
          color: #999;
          font-size: 28rpx;
        }
      }
    }

    .switch-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* 单选框样式 */
    .radio-group {
      display: flex;
      align-items: center;

      .radio-item {
        display: flex;
        align-items: center;
        margin-right: 30rpx;
        font-size: 28rpx;
        color: #333;
      }
    }

    /* 折叠面板样式*/
    .collapse-panel {
      margin-bottom: 40rpx;
      border: 1px solid#ddd;
      border-radius: 8rpx;

      .collapse-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx;
        cursor: pointer;
        background-color: #f8f8f8;

        .collapse-title {
          font-size: 28rpx;
          color: #000; /* 加深颜色 */
          font-weight: 500;
        }

        .collapse-arrow {
          transition: transform 0.3s ease;
          font-size: 32rpx;
          color: #999;

          &.arrow-rotate {
            transform: rotate(180deg);
          }
        }
      }

      .collapse-content {
        padding: 20rpx;
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

  // 移除原来的.sub-btn样式，因为现在使用的是 hj-button 组件
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    .loading-img {
      width: 80%;
    }
  }
  .selector-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    z-index: 1000;
  }
  .selector-content {
    background-color: #fff;
    border-top-left-radius: 24rpx;
    border-top-right-radius: 24rpx;
    padding-bottom: env(safe-area-inset-bottom);
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }
  .selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #eee;
  }
  .selector-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  .close-btn {
    font-size: 40rpx;
    color: #999;
    padding: 0 20rpx;
  }
  .selector-list {
    max-height: 60vh;
    overflow-y: auto;
  }
  .selector-item {
    display: flex;
    align-items: center;
    padding: 24rpx 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
  }
  .selector-item:active {
    background-color: #f9f9f9;
  }
  .selector-item.active {
    background-color: #f0f7ff;
  }
  .selector-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 24rpx;
    background-color: #eee;
  }
  .selector-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .selector-name {
    font-size: 30rpx;
    color: #333;
    margin-bottom: 8rpx;
  }
  .selector-role {
    font-size: 24rpx;
    color: #007aff;
    background-color: rgba(0, 122, 255, 0.1);
    padding: 4rpx 12rpx;
    border-radius: 6rpx;
    align-self: flex-start;
  }
  .selector-check {
    color: #007aff;
    font-size: 36rpx;
    font-weight: bold;
  }
</style>
