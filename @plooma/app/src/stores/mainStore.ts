import { defineStore } from 'pinia';
import { uid } from 'quasar';
import { reactive } from 'vue';

type TypeNotePadNode = Record<string, {htmlText: string, nodeUID: string, nodeTitle: string}>;

export const useMainStore = defineStore('MainStore', {
  state: () => ({
    currentProfile: 'default',
    profiles: {} as Record<string, {
        nodes: TypeNotePadNode,
        timeline: Array<string>
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

      if (!this.profiles[this.currentProfile]) {
          this.profiles[this.currentProfile] = reactive({
            nodes: {},
            timeline: reactive([])
          });
      }
      const newNodeUID = this.createNewNode({profileName: this.currentProfile});
      this.addNodeAt(newNodeUID, 0);
    },
    addNodeAt(nodeUID: string, indx: number) {
      this.profiles[this.currentProfile].timeline.splice(indx, 0, nodeUID);
    },
    createNewNode (params: {profileName: string}) {
      const {profileName} = params;
      const nodeUID = uid();
      const newNode = {
        nodeUID,
        htmlText: '',
        nodeTitle: 'NoTitle',
      };
      this.profiles[profileName].nodes[nodeUID] = newNode;

      return nodeUID;
    }
  }
});
