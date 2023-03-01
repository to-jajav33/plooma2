import { defineStore } from 'pinia';
import { uid } from 'quasar';
import { reactive } from 'vue';

export const useMainStore = defineStore('MainStore', {
  state: () => ({
    currentProfile: 'default',
    profiles: {} as Record<string, {
        nodes: Record<string, {htmlText: string, nodeUID: string}>
      }>
  }),

  getters: {
    // doubleCount (state) {
    //   return state.counter * 2;
    // }
  },

  actions: {
    createProfile (params: {profileName: string}) {
      const {profileName} = params;
      if (!profileName) return;

      this.currentProfile = profileName;

      if (!this.profiles[this.currentProfile]) this.addNodeToProfile({profileName: this.currentProfile});
      this.profiles[this.currentProfile].nodes
    },
    addNodeToProfile (params: {profileName: string}) {
      const {profileName} = params;
      const nodeUID = uid();
      const obj = reactive({
        nodes: {
          [nodeUID]: {
            nodeUID,
            htmlText: ''
          }
        }
      });
      this.profiles[profileName] = obj;
    }
  }
});
