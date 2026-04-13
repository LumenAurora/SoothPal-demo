const state = require('./utils/state');

App({
  onLaunch() {
    state.loadScenario('rising');
  },
});
