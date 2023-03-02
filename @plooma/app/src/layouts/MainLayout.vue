<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          {{ packageJson.productName }}
        </q-toolbar-title>

        <div>Quasar v{{ packageJson.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <div class="column items-center" style="box-sizing: border-box; border: 2px solid rgba(128,128,128, 0.15);">
        <q-list v-if="mainStore.profiles[mainStore.currentProfile] && Object.keys(mainStore.profiles[mainStore.currentProfile].nodes).length">
          <q-item-label
            header
          >
            Story Nodes
            <q-item-label caption>Drag any one of these to timeline</q-item-label>
          </q-item-label>

          <q-item :key="`EditPage_StoryNodeList_${node.nodeUID}`" v-for="(node, nodeUID, nodeIndex) in mainStore.profiles[mainStore.currentProfile].nodes">
            <q-btn color="primary" :data-node-index="nodeIndex" draggable="true" @dragstart="(ev) => onDrag(ev, nodeIndex, nodeUID)" icon="drag_indicator" align="left">
              {{node.nodeTitle}}
            </q-btn>
          </q-item>
        </q-list>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent,
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
ref } from 'vue';
import { useMainStore } from '../stores/mainStore';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import packageJson from '../../package.json';


export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup () {
    const mainStore = useMainStore();
    const leftDrawerOpen = ref(false)

    return {
      packageJson,
      mainStore,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      onDrag(ev: DragEvent, nodeIndex: number, nodeUID: string) {
        leftDrawerOpen.value = false;
        if (!ev.dataTransfer) return;
        ev.dataTransfer.setData('node-index', String(nodeIndex));
        ev.dataTransfer.setData('node-uid', nodeUID);
      }
    }
  }
});
</script>
