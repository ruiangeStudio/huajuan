<template>
  <view v-if="!loading" class="admin-container">
    <view class="header">
      <view class="header-title">游戏账号管理</view>
      <view class="header-subtitle">管理所有用户的游戏账号信息</view>
    </view>

    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-number">{{ dataLength }}</text>
        <text class="stat-label">总账号数</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ defaultAccountsCount }}</text>
        <text class="stat-label">默认账号</text>
      </view>
      <view
        class="stat-item export-btn"
        :class="{ disabled: exportLoading || list.length === 0 }"
        @click="exportTable"
      >
        <view v-if="!exportLoading" class="export-content">
          <text class="export-icon">📥</text>
          <text class="export-text">导出表格</text>
        </view>
        <view v-else class="export-loading">
          <text class="loading-text">导出中...</text>
        </view>
      </view>
    </view>

    <view v-if="list.length === 0" class="empty">
      <image src="/static/images/default.png" class="empty-img" mode="widthFix" />
      <view>暂无默认账号数据</view>
    </view>

    <view v-else class="table-container">
      <view class="table">
        <view class="table-header">
          <view class="th th-nick">游戏昵称</view>
          <view class="th th-account">游戏账号</view>
          <view class="th th-server">游戏区服</view>
          <view class="th th-tieba">贴吧昵称</view>
        </view>
        <view
          v-for="(item, idx) in list"
          :key="item._id || idx"
          :class="['table-row', idx % 2 === 0 ? 'row-even' : 'row-odd']"
          @click="viewAccountDetail(item)"
        >
          <view class="td th-nick">{{ item.game_nick_name }}</view>
          <view class="td th-account">{{ item.game_AccountNumber }}</view>
          <view class="td th-server">{{ item.game_server }}</view>
          <view class="td th-tieba">{{ item.tieba_name }}</view>
        </view>
      </view>
    </view>
  </view>

  <view v-if="loading" :style="`width: 100%;height: ${windowHeight}px;`" class="loading-container">
    <image class="loading-img" :src="loadingImg" mode="widthFix"></image>
  </view>
</template>

<script setup>
  import { onLoad } from '@dcloudio/uni-app';
  import { ref, computed } from 'vue';
  import { getAllGameAccountAPI, exportGameAccountAPI } from '../../api/gameAccount.js';
  import loadingImg from '../../static/13395852403014388.gif';

  const windowHeight = uni.getSystemInfoSync().windowHeight;
  const list = ref([]);
  const loading = ref(true);
  const exportLoading = ref(false);
  const dataLength = ref(0);
  // 计算统计数据
  const defaultAccountsCount = computed(() => {
    return list.value.filter((account) => account.is_default).length;
  });

  const uniqueUsersCount = computed(() => {
    const userIds = new Set(list.value.map((account) => account.userId));
    return userIds.size;
  });

  const getList = async () => {
    loading.value = true;
    try {
      const { data } = await getAllGameAccountAPI();
      console.log('获取到的账号数据：', data);
      dataLength.value = data.length;
      list.value = (data || []).filter((item) => item.is_default);
    } catch (error) {
      console.error('获取账号列表失败：', error);
      list.value = [];
      await uni.showToast({
        title: '获取数据失败',
        icon: 'none',
      });
    } finally {
      loading.value = false;
    }
  };

  // 查看账号详情
  const viewAccountDetail = (account) => {
    uni.showModal({
      title: '账号详情',
      content: `游戏昵称：${account.game_nick_name}\n游戏账号：${account.game_AccountNumber}\n所属用户：${account.userId}`,
      showCancel: false,
      confirmText: '确定',
    });
  };

  // 导出表格功能（小程序专用）
  const exportTable = async () => {
    if (exportLoading.value || list.value.length === 0) return;
    exportLoading.value = true;
    uni.downloadFile({
      url: `${import.meta.env.VITE_APP_API_URL}/gameAccount/export`,
      success: async (res) => {
        const { tempFilePath } = res;
        console.log('下载文件成功：', tempFilePath);
        uni.shareFileMessage({
          filePath: tempFilePath,
          success: () => {
            uni.showToast({
              title: '文件已分享到聊天',
              icon: 'success',
            });
            exportLoading.value = false;
          },
          fail: (err) => {
            console.error('保存文件失败：', err);
            uni.showToast({
              title: '保存文件失败',
              icon: 'none',
            });
            exportLoading.value = false;
          },
        })
      },
      fail: (err) => {
        console.error('下载文件失败：', err);
        uni.showToast({
          title: '文件下载失败',
          icon: 'none',
        });
        exportLoading.value = false;
      },
    });
  };

  onLoad(() => {
    getList();
  });
</script>

<style scoped lang="scss">
  .admin-container {
    padding: 20rpx;
    background: #f7f8fa;
    min-height: 100vh;
  }

  .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16rpx;
    padding: 40rpx 30rpx;
    margin-bottom: 30rpx;
    color: white;

    .header-title {
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 12rpx;
    }

    .header-subtitle {
      font-size: 26rpx;
      opacity: 0.9;
    }
  }

  .stats-bar {
    display: flex;
    background: white;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);

    .stat-item {
      flex: 1;
      text-align: center;
      position: relative;

      &:not(:last-child)::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 2rpx;
        height: 40rpx;
        background: #e5e5e5;
      }

      .stat-number {
        display: block;
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 8rpx;
      }

      .stat-label {
        font-size: 24rpx;
        color: #666;
      }
    }

    .export-btn {
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 12rpx;

      &:hover {
        background: #f0f0f0;
      }

      .export-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8rpx;

        .export-icon {
          font-size: 32rpx;
        }

        .export-text {
          font-size: 24rpx;
          color: #333;
          font-weight: 500;
        }
      }

      .export-loading {
        .loading-text {
          font-size: 24rpx;
          color: #666;
        }
      }
      .export-btn.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    }
  }

  .accounts-list {
    .account-card {
      background: white;
      border-radius: 16rpx;
      margin-bottom: 24rpx;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
      overflow: hidden;
      position: relative;

      .default-tag {
        position: absolute;
        top: 20rpx;
        right: 20rpx;
        background: linear-gradient(90deg, #ffd700 0%, #ffe066 100%);
        color: #b48800;
        font-size: 22rpx;
        padding: 8rpx 16rpx;
        border-radius: 20rpx;
        font-weight: bold;
        z-index: 10;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
      }

      .account-header {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        padding: 30rpx;
        color: white;

        .user-info {
          margin-bottom: 8rpx;

          .user-id {
            font-size: 26rpx;
            opacity: 0.9;
          }
        }

        .account-id {
          .account-id-text {
            font-size: 22rpx;
            opacity: 0.8;
            font-family: monospace;
          }
        }
      }

      .account-details {
        padding: 30rpx;

        .detail-row {
          display: flex;
          align-items: center;
          margin-bottom: 24rpx;

          &:last-child {
            margin-bottom: 0;
          }

          .detail-icon {
            font-size: 32rpx;
            margin-right: 20rpx;
            width: 40rpx;
            text-align: center;
          }

          .detail-content {
            flex: 1;

            .detail-label {
              display: block;
              font-size: 24rpx;
              color: #666;
              margin-bottom: 4rpx;
            }

            .detail-value {
              font-size: 28rpx;
              color: #333;
              font-weight: 500;
              word-break: break-all;
            }
          }
        }
      }
    }
  }

  .empty {
    text-align: center;
    color: #888;
    padding: 80rpx 0;

    .empty-img {
      width: 200rpx;
      margin: 0 auto 32rpx auto;
      display: block;
      opacity: 0.6;
    }
  }

  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;

    .loading-img {
      width: 80%;
    }
  }
  .table-container {
    width: 100%;
  }
  .table {
    background: #fff;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }
  .table-header,
  .table-row {
    display: flex;
    align-items: center;
  }
  .table-header {
    background: #f5f7fa;
    color: #666;
    font-size: 24rpx;
    font-weight: 600;
    padding: 20rpx 16rpx;
    border-bottom: 2rpx solid #eee;
  }
  .table-row {
    padding: 22rpx 16rpx;
    border-bottom: 2rpx solid #f2f2f2;
  }
  /* Zebra striping */
  .table-row.row-even {
    background-color: #fafafa;
  }
  .table-row.row-odd {
    background-color: #ffffff;
  }
  .table-row:last-child {
    border-bottom: none;
  }
  .th,
  .td {
    padding: 0 10rpx;
  }
  .th-nick,
  .td.th-nick {
    flex: 1.2;
  }
  .th-account,
  .td.th-account {
    flex: 1.2;
  }
  .th-server,
  .td.th-server {
    flex: 1.6;
  }
  .th-tieba,
  .td.th-tieba {
    flex: 1;
  }
  .td {
    color: #333;
    font-size: 28rpx;
    word-break: break-all;
  }
</style>
