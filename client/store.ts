import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

/**
 * Storage for data that needs to be accessed from various compoentns.
 */
const store = new Vuex.Store({
  state: {
    filter: null, // Username to filter shown freets by (null = show all)
    email: null, // email of the logged in user
    lastname: null, //last name of the logged in user
    firstname: null, //first name of the logged in user
    alerts: {}, // global success/error messages encountered during submissions to non-visible forms
    projects: [], // All projects the signed in user is a part of
    invites: [], // All projects the signed in user is invited to
    updates: {}, // mapping from project IDs to a list of updates
    allthanks: {}, // mapping from update ID to all thanks for that update
    eyeswanted: {}, // mapping from user to a list of eyes wanted updates
    alleyeswanted: {}, // All eyes wanted in the app
    userFilter: null,
    tagFilter: null,
    currentUpdate: null,
  },
  mutations: {
    alert(state, payload) {
      /**
       * Add a new message to the global alerts.
       */
      Vue.set(state.alerts, payload.message, payload.status);
      setTimeout(() => {
        Vue.delete(state.alerts, payload.message);
      }, 3000);
    },
    setEmail(state, email) {
      /**
       * Update the stored email to the specified one.
       * @param email - new email to set
       */
      state.email = email;
    },
    setLastname(state, lastname) {
      /**
       * Update the stored email to the specified one.
       * @param lastname - new email to set
       */
      state.lastname = lastname;
    },
    setFirstname(state, firstname) {
      /**
       * Update the stored email to the specified one.
       * @param firstname - new email to set
       */
      state.firstname = firstname;
    },
    updateFilter(state, filter) {
      /**
       * Update the stored freets filter to the specified one.
       * @param filter - Username of the user to fitler freets by
       */
      state.filter = filter;
    },
    setCurrentUpdate(state, update) {
      state.currentUpdate = update;
    },
    updateProjects(state, projects) {
      /**
       * Update the stored projects to the provided projects.
       * @param projects - Projects to store
       */
      state.projects = projects;
    },
    updateThanks(state, thanks){
      /**
       * Update the stored thanks to the provided thanks.
       * @param thanks - Thanks to store
       */
      state.allthanks = thanks;
    },
    updateEyesWanted(state, eyeswanted){
      /**
       * Update the stored thanks to the provided thanks.
       * @param eyeswanted - Thanks to store
       */
      state.eyeswanted = eyeswanted;
    },
    updateAllEyesWanted(state, alleyeswanted){
      /**
       * Update the stored thanks to the provided thanks.
       * @param alleyeswanted - Thanks to store
       */
      state.alleyeswanted = alleyeswanted;
    },
    async refreshProjects(state) {
      /**
       * Request the server for the currently available freets.
       */
      try {
        const res = await fetch('/api/projects');
        const resJson = await res.json();
        if (!res.ok) {
          throw Error(resJson.error);
        }
        state.projects = resJson;
      } catch (e) {
        console.log(e);
      }
    },
    async refreshInvites(state) {
      try {
        const res = await fetch('/api/projects?invited=true');
        const resJson = await res.json();
        if (!res.ok) {
          throw Error(resJson.error);
        }
        state.invites = resJson;
      } catch (e) {
        console.log(e);
      }
    },
    async refreshUpdates(state, projectId) {
      try {
        const res = await fetch(`/api/updates?projectId=${projectId}`);
        const resJson = await res.json();
        if (!res.ok) {
          throw Error(resJson.error);
        }
        Vue.set(state.updates, projectId, resJson);
      } catch (e) {
        console.log(e);
      }
    },
    async refreshEyesWanted(state) {
      try {
        const res = await fetch(`/api/eyeswanted`);
        const resJson = await res.json();
        if (!res.ok) {
          throw Error(resJson.error);
        }
        const eyeswanted = resJson.reduce((allEyes, e) => {
          allEyes[e.update._id] = e;
          return allEyes;
        }, {});
        state.eyeswanted = eyeswanted;
      } catch (e) {
        console.log(e);
      }
    },
    async refreshUpdateEyesWanted(state, updateId) {
      try {
        const res = await fetch(`/api/eyeswanted?updateId=${updateId}`, {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        const resJson = await res.json();
        if (!res.ok) {
          throw Error(resJson.error);
        }
        Vue.set(state.alleyeswanted, updateId, resJson.eyesWanted);
      } catch (e) {
        console.log(e);
      }
    },
    async refreshAllThanks(state, updateId){
      /**
       * Request the server for all the alerts (risks) the user posted.
       */
      const url = `/api/thanks/${updateId}`;
      const res = await fetch(url);
      const resJson = await res.json();
      Vue.set(state.allthanks, updateId, resJson);
     },
    setUserFilter(state, userFilter) {
      state.userFilter = userFilter;
    },
    setTagFilter(state, tagFilter) {
      state.tagFilter = tagFilter;
    }
  },
  // Store data across page refreshes, only discard on browser close
  plugins: [createPersistedState()]
});

export default store;
