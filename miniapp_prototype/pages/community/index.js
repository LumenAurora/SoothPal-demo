Page({
  data: {
    postInput: '',
    threads: [
      {
        id: 't1',
        room: '术后康复',
        title: '今天走路20分钟，大家都怎么分段？',
        meta: '18 条新消息',
      },
      {
        id: 't2',
        room: '腰背管理',
        title: '久坐后腰痛，有没有3分钟动作？',
        meta: '9 条新消息',
      },
      {
        id: 't3',
        room: '睡眠支持',
        title: '夜间疼痛影响入睡，求经验',
        meta: '27 条新消息',
      },
    ],
  },

  onPostInput(event) {
    this.setData({
      postInput: event.detail.value,
    });
  },

  onPost() {
    const content = (this.data.postInput || '').trim();
    if (!content) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none',
      });
      return;
    }

    const draft = {
      id: 'draft-' + Date.now(),
      room: '我的提问',
      title: content,
      meta: '刚刚发布',
    };

    this.setData({
      postInput: '',
      threads: [draft].concat(this.data.threads),
    });
  },
});
