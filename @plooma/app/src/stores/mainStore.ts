import Dexie from 'dexie';
import { defineStore } from 'pinia';
import { uid } from 'quasar';
import { reactive } from 'vue';
import { Notify } from 'quasar';

interface ILastState {id: 0, currentProfile: string}
interface IProfiles {
  profileName: string,
  nodeUIDs: string[],
  timeline: string[],
}
interface INodes {
  nodeUID: string,
  profileName: string,
  htmlText: string,
  nodeTitle: string
}

const DB_VERSION = 1;
class MainDatabase extends Dexie {
  lastState!: Dexie.Table<ILastState, string>
  profiles!: Dexie.Table<IProfiles, string>
  nodes!: Dexie.Table<INodes, string>

  constructor() {
    super(MainDatabase.name);

    this.version(DB_VERSION).stores({
      lastState: 'id, currentProfile',
      profiles: 'profileName, *nodeUIDs, *timeline',
      nodes: 'nodeUID, profileName, htmlText, nodeTitle'
    });
  }
  
  stringToNumber(str: string): number {
    let numberStr = '';
    for (let i = 0; i < str.length; i++) {
      numberStr = numberStr + str.charCodeAt(i);
    }

    return parseInt(numberStr);
  }
  
  async save(lastState: ILastState, profiles: IProfiles, nodes: INodes[]) {
    const bulkPut = [
      this.lastState.put(lastState),
      this.profiles.put(profiles),
      this.nodes.bulkPut(nodes)
    ];

    await Promise.all(bulkPut);
  }

  async getLastState() {
    return await this.lastState.get({id: 0});
  }

  async getNodesOfProfileName(profileName: string) {
    const arr = await this.nodes.where({profileName}).toArray();
    const nodes = {} as Record<string, INodes>;
    for (const item of arr) {
      nodes[item.nodeUID] = item;
    }

    return nodes;
  }

  async getTimelineOfProfileName(profileName: string) {
    return await this.profiles.get({profileName})
  }
}

const mainDatabase = new MainDatabase();

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
    async init() {
      const lastState = await mainDatabase.getLastState();
      this.currentProfile = lastState?.currentProfile || 'default';

      const nodes = await mainDatabase.getNodesOfProfileName(this.currentProfile);
      const timeline = (await mainDatabase.getTimelineOfProfileName(this.currentProfile))?.timeline;

      this.profiles[this.currentProfile] = reactive({
        nodes: reactive(nodes || {}),
        timeline: reactive(timeline || [])
      });
    },
    async createProfile (params: {profileName: string}) {
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

      const skipLocalSave = true;
      for (const i in templateArr) {
        const templateInfo = templateArr[i];
        const newNodeUID = this.createNewNode({profileName: this.currentProfile, nodeTitle: templateInfo.title});
        this.addTimelineNodeAt(newNodeUID, Number(i), skipLocalSave);
      }

      await this.saveLocal();
    },
    async addTimelineNodeAt(nodeUID: string, indx: number, skipLocalSave = false) {
      this.profiles[this.currentProfile].timeline.splice(indx, 0, nodeUID);
      if (!skipLocalSave) {
        await this.saveLocal();
      }
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
    async exportTimeline() {
      const cleanStr = this.generateTimelineString();

      const blob = new Blob([cleanStr], {type: 'text/plain'});

      const aElem = document.createElement('a');
      aElem.href = URL.createObjectURL(blob);
      aElem.download = 'Plooma.txt';
      aElem.click();
      URL.revokeObjectURL(aElem.href);
    },
    generateTimelineString() {
      const timeline = this.profiles[this.currentProfile].timeline;
      let str = '';

      for (const nodeUID of timeline) {
        const nodeInfo = this.profiles[this.currentProfile].nodes[nodeUID];

        str = str + nodeInfo.htmlText;
      }

      const tempElem = document.createElement('span');
      tempElem.innerHTML = str;
      const scriptTagsToBeRemoved = tempElem.querySelectorAll('script');
      for (const scripElem of scriptTagsToBeRemoved) {
        scripElem.remove();
      }

      str = tempElem.innerHTML;

      return str;
    },
    async removeTimelineNodeAt(nodeIndex: number) {
      this.profiles[this.currentProfile].timeline.splice(nodeIndex, 1);
      await this.saveLocal();
    },
    async saveLocal() {
      const nodes = [] as INodes[];
      for (const nodeUID in this.profiles[this.currentProfile].nodes) {
        const nodeInfo = this.profiles[this.currentProfile].nodes[nodeUID];
        nodes.push({
          nodeUID,
          nodeTitle: nodeInfo.nodeTitle,
          profileName: this.currentProfile,
          htmlText: nodeInfo.htmlText
        });
      }
      
      const notif = Notify.create({
        group: false, // required to be updatable
        timeout: 0, // we want to be in control when it gets dismissed
        spinner: true,
        message: 'Saving...',
      });

      await mainDatabase.save(
        {
          id: 0, // this should always be zero so we always get the last state
          currentProfile: this.currentProfile
        },
        {
          profileName: this.currentProfile,
          nodeUIDs: Object.keys(this.profiles[this.currentProfile].nodes),
          timeline: [...this.profiles[this.currentProfile].timeline]
        },
        nodes
      );

      notif({
        icon: 'done', // we add an icon
        spinner: false, // we reset the spinner setting so the icon can be displayed
        message: 'Saving Completed',
        timeout: 2500 // we will timeout it in 2.5s
      });
    }
  }
});
