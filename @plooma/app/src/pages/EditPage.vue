<template>
  <q-page class="flex row items-center justify-around">
    <div class="column col-9">
      <div @dragover="onDragOver" @drop="onDrop" class="row items-center justify-center q-pa-sm q-ma-md" style="box-sizing: border-box; outline: 2px dashed rgba(128, 128, 128, 0.15);">
        <q-btn size="xs" round icon="add" color="primary" @click="mainStore.addNodeAt(mainStore.createNewNode({profileName: mainStore.currentProfile}), 0)"></q-btn>
      </div>

      <div :key="nodeUID" v-for="(nodeUID, nodeIndex) in mainStore.profiles[mainStore.currentProfile].timeline">
        <note-pad-component :nodeUID="nodeUID" :profileName="mainStore.currentProfile"></note-pad-component>
        <div @dragover="onDragOver" @drop="onDrop" class="row items-center justify-center q-pa-sm q-ma-md" style="box-sizing: border-box; outline: 2px dashed rgba(128, 128, 128, 0.15);">
          <q-btn size="xs" round icon="add" color="primary" @click="mainStore.addNodeAt(mainStore.createNewNode({profileName: mainStore.currentProfile}), nodeIndex + 1)"></q-btn>
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

    return {
      mainStore,
      onDragOver(ev: DragEvent) {
        // allow drop
        ev.preventDefault();
      },
      onDrop(ev: DragEvent) {
        if (!ev.dataTransfer) return;
        const nodeIndex = Number(ev.dataTransfer.getData('node-index'));
        const nodeUID = ev.dataTransfer.getData('node-uid');
        mainStore.addNodeAt(nodeUID, nodeIndex);
      }
    };
  }
});
</script>
