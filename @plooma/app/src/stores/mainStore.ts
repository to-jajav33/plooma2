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

      // heroes journey template
      // https://www.movieoutline.com/articles/the-hero-journey-mythic-structure-of-joseph-campbell-monomyth.html
      const templateArr = [
        {title: 'Ordinary World'},
        {title: 'Call To Adventure'},
        {title: 'Refusal'},
        {title: 'Meeting with the Mentor'},
        {title: 'Crossing the Threshold and accepts mission'},
        {title: 'Challenges/Obstacles'},
        {title: 'Learn what skills are needed the Greatest Challenge...Is the hero ready for the biggest challenge yet?'},
        {title: 'Challenge to aquire a skill(s)... Mini Boss Battle'},
        {title: 'Reward.. (hero acuqies skill(s) and transforms to a new state)'},
        {title: 'Road Back... is/are the Reward/skill(s) going to help solve the conflict?'},
        {title: 'Climax... Final boss battle'},
        {title: 'Return to Ordinary World a changed person. Receives final reward/lesson/skill/gift/etc'},
      ];

      for (const i in templateArr) {
        const templateInfo = templateArr[i];
        const newNodeUID = this.createNewNode({profileName: this.currentProfile, nodeTitle: templateInfo.title});
        this.addTimelineNodeAt(newNodeUID, Number(i));
      }
    },
    addTimelineNodeAt(nodeUID: string, indx: number) {
      this.profiles[this.currentProfile].timeline.splice(indx, 0, nodeUID);
    },
    createNewNode(params: {profileName: string, nodeTitle?: string}) {
      const {profileName, nodeTitle} = params;
      const nodeUID = uid();
      const newNode = {
        nodeUID,
        htmlText: '',
        nodeTitle: nodeTitle || 'Node Title',
      };
      this.profiles[profileName].nodes[nodeUID] = newNode;

      return nodeUID;
    },
    removeTimelineNodeAt(nodeIndex: number) {
      this.profiles[this.currentProfile].timeline.splice(nodeIndex, 1);
    }
  }
});
