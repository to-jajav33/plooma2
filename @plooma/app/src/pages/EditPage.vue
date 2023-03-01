<template>
  <q-page class="flex row items-center justify-around">
    <div class="column">
      <div class="row items-center justify-center q-pa-sm q-ma-md" style="box-sizing: border-box; outline: 2px dashed rgba(0, 0, 0, 0.15);">
        <q-btn round icon="add" color="primary" @click="mainStore.addNodeAt(mainStore.createNewNode({profileName: mainStore.currentProfile}), 0)"></q-btn>
      </div>

      <div :key="node.nodeUID" v-for="(node, nodeIndex) in mainStore.profiles[mainStore.currentProfile].nodes">
        <note-pad-component :nodeUID="node.nodeUID" :profileName="mainStore.currentProfile"></note-pad-component>
        <div class="row items-center justify-center q-pa-sm q-ma-md" style="box-sizing: border-box; outline: 2px dashed rgba(0, 0, 0, 0.15);">
          <q-btn round icon="add" color="primary" @click="mainStore.addNodeAt(mainStore.createNewNode({profileName: mainStore.currentProfile}), nodeIndex + 1)"></q-btn>
        </div>
      </div>
    </div>
    
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent
} from 'vue';
import { useMainStore } from '../stores/mainStore';
import NotePadComponent from '../components/NotePadComponent.vue';

export default defineComponent({
  name: 'IndexPage',
  components: { NotePadComponent },
  setup() {
    const mainStore = useMainStore();

    console.log(mainStore.profiles.default);
    return {
      mainStore,
    };
  }
});
</script>
