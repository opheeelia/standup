<template>
  <div id="app">
    <header>
      <NavBar />
    </header>
    <router-view />
  </div>
</template>

<script>
import NavBar from '@/components/common/NavBar.vue';

export default {
  name: 'App',
  components: {NavBar},
  beforeCreate() {
    // Sync stored username to current session
    fetch('/api/users/session', {
      credentials: 'same-origin' // Sends express-session credentials with request
    }).then(res => res.json()).then(res => {
      const user = res.user;
      this.$store.commit('setEmail', user ? user.email : null);
      this.$store.commit('setLastname', user ? user.lastName : null);
      this.$store.commit('setFirstname', user ? user.firstName : null);
      this.$store.commit('refreshProjects');
    });
    this.$store.commit('refreshEyesWanted');
    // Clear alerts on page refresh
    this.$store.state.alerts = {};
  },
  watch: {
    '$route': {
      handler: function(value) {
        const validRoutes = [
          'Updates', 'UpdatesPerUser', 'UpdateDetails',
        ];
        if (!validRoutes.includes(value.name)) {
          this.$store.commit('setCurrentUpdate', null);
        }
      },
      deep: true,
      immediate: true,
    },
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;700;400&display=swap');

* {
  box-sizing: border-box;
  font-family: 'Roboto', sans-serif;
}

body {
  height: 100vh;
  flex-direction: column;
  display: flex;
  padding: 0;
  margin: 0;
  font-size: 16px;
}

main {
  width: 66%;
  margin: auto;
}

.alerts {
    position: absolute;
    z-index: 9999;
    bottom: 0;
    top: 100%;
    left: 50%;
    transform: translate(-50%, 10%);
    width: 100%;
    text-align: center;
}

.alerts article {
    border-radius: 5px;
    padding: 10px 20px;
    color: #fff;
}

.alerts p {
    margin: 0;
}

.alerts .error {
    background-color: rgb(166, 23, 33);
}

.alerts .success {
    background-color: rgb(45, 135, 87);
}

ul.reset,
ul.reset li {
  margin: 0;
  padding: 0;
  text-indent: 0;
  list-style-type: none;
}

button {
  border: none;
  border: 2px solid transparent;
  font-family: inherit;
  padding: 6px 20px;
  border-radius: 100px;
  font-size: 16px;
  background: #c4b5e0;
  transition: all 0.1s ease-in-out;
  cursor: pointer;
  border-color: #50406d;
}

button:hover {
  filter: brightness(90%);
}

button.text-btn {
  padding: 4px 12px;
  background: transparent;
  border-color: transparent;
}

button.invert {
  background: transparent;
}


button.invert:hover {
  background: #e8e3e8;
  filter: none;
}

button.invert.active {
  background: #e2dce5;
}

button.thin-btn {
  padding: 4px 12px;
}

.status {
  background: #bcbcbc;
  border-radius: 8px;
  padding: 4px 12px;
  width: fit-content;
  display: inline-block;
}

.status.In-Progress {
  background: #FBC358;
}
.status.Completed {
  background: #69E8AB;
}
.preview {
  border: 2px solid #a4a4a4;
  border-radius: 12px;
  background: #F8F8F8;
  padding: 24px;
  cursor: pointer;
}

.preview:hover {
  background: #f0eef0;
}

main.left-panel {
  margin: 0 0 0 17%;
  display: inline-block;
  transition: width 1ms ease-in-out;
  background-color: #fff;
  padding-right: 20px;
}
main.left-panel.thin {
  width: 50%;
}
.details-container {
  display: inline-block;
  position: fixed;
  top: 0;
  right: 0;
  background-color: #f8f8f8;
  border-left: 2px solid #a4a4a4;
  width: 17%;
  height: 100%;
  margin-left: 8px;
  padding: 40px 36px 0 36px;
}

.details-container > button {
  position: absolute;
  top: 16px;
  right: 16px;
  text-decoration: underline;
}
main.left-panel.thin + .details-container {
  width: 33%;
}

/** Match the style of multiselect */
input, textarea {
  outline: none;
  border-radius: 5px;
  padding: 8px;
  border: 1px solid #a4a4a4 ;
}
.multiselect__tags{
  border: 1px solid #a4a4a4 !important;
}


textarea.error,
input.error {
  border-color: #ca0000;
}

p.error-message {
  color: #ca0000;
  font-size: 80%;
  margin: 4px 0;
}
</style>
