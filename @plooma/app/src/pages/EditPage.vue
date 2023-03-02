<template>
  <q-page class="flex row items-center justify-around">
    <div class="column col-9">
      <div @dragover="onDragOver" @drop="(ev) => onDrop(ev, 0)" class="row items-center justify-center q-pa-sm q-ma-md" style="box-sizing: border-box; outline: 2px dashed rgba(128, 128, 128, 0.15);">
        <q-btn size="xs" round icon="add" color="primary" @click="mainStore.addTimelineNodeAt(mainStore.createNewNode({profileName: mainStore.currentProfile}), 0)"></q-btn>
      </div>

      <div :key="nodeUID" v-for="(nodeUID, nodeIndex) in mainStore.profiles[mainStore.currentProfile].timeline">
        <q-btn @click="onRemoveFromTimeline(nodeIndex)" color="negative" icon="delete" outline flat></q-btn>
        <note-pad-component :nodeUID="nodeUID" :profileName="mainStore.currentProfile"></note-pad-component>
        <div @dragover="onDragOver" @drop="(ev) => onDrop(ev, nodeIndex + 1)" class="row items-center justify-center q-pa-sm q-ma-md" style="box-sizing: border-box; outline: 2px dashed rgba(128, 128, 128, 0.15);">
          <q-btn size="xs" round icon="add" color="primary" @click="mainStore.addTimelineNodeAt(mainStore.createNewNode({profileName: mainStore.currentProfile}), nodeIndex + 1)"></q-btn>
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
      onDrop(ev: DragEvent, nodeIndex: number) {
        if (!ev.dataTransfer) return;
        const nodeUID = ev.dataTransfer.getData('node-uid');
        mainStore.addTimelineNodeAt(nodeUID, nodeIndex);
      },
      onRemoveFromTimeline(nodeIndex: number) {
        mainStore.removeTimelineNodeAt(nodeIndex);
      }
    };
  }
});
</script>
