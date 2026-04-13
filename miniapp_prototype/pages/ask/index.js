const rag = require('../../utils/rag');

const defaultQuestion = '最近腰背痛反复，晚上睡不好，还能继续散步吗？';

Page({
  data: {
    query: defaultQuestion,
    result: null,
  },

  onShow() {
    if (!this.data.result) {
      this.onSubmit();
    }
  },

  onInput(event) {
    this.setData({
      query: event.detail.value,
    });
  },

  onUseDemoQuestion() {
    this.setData({
      query: defaultQuestion,
    });
  },

  onSubmit() {
    const query = this.data.query && this.data.query.trim() ? this.data.query.trim() : defaultQuestion;
    const result = rag.askWithRag(query);
    this.setData({ result });
  },
});
