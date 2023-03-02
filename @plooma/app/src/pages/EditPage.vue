<template>
  <q-page class="flex row items-center justify-around">
    <div class="column col-9">
      <div @dragover="onDragOver" @drop="(ev) => onDrop(ev, 0)" class="row items-center justify-center q-pa-sm q-ma-md" style="box-sizing: border-box; outline: 2px dashed rgba(128, 128, 128, 0.15);">
        <q-btn size="xs" round icon="add" color="primary" @click="mainStore.addTimelineNodeAt(mainStore.createNewNode({profileName: mainStore.currentProfile}), 0)"></q-btn>
      </div>

      <div :key="nodeUID" v-for="(nodeUID, nodeIndex) in mainStore.profiles[mainStore.currentProfile].timeline">
        <div class="row">
          <q-btn @click="() => shouldShowMenus = !shouldShowMenus" color="primary" :icon="shouldShowMenus ? 'visibility' : 'visibility_off'" outline flat></q-btn>
          <div class="row" v-if="shouldShowMenus">
            <q-btn @click="onRemoveFromTimeline(nodeIndex)" color="negative" icon="delete" outline flat></q-btn>
          </div>
        </div>
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
  defineComponent,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ref
} from 'vue';
import {
  useMainStore } from '../stores/mainStore';
import NotePadComponent from '../components/NotePadComponent.vue';

export default defineComponent({
  name: 'IndexPage',
  components: { NotePadComponent },
  setup() {
    const mainStore = useMainStore();
    let shouldShowMenus = ref(false);

    return {
      mainStore,
      shouldShowMenus,
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
