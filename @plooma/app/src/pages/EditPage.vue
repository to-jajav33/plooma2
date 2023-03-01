<template>
  <q-page class="column items-center justify-center col-6">
    <div class="row items-center justify-center q-pa-sm q-ma-md" style="box-sizing: border-box; outline: 2px dashed rgba(0, 0, 0, 0.15); width: 50%;">
      <q-btn round icon="add" color="primary"></q-btn>
    </div>
    <note-pad-component style="width: 50%;" :nodeUID="node.nodeUID" :key="node.nodeUID" :profileName="mainStore.currentProfile" v-for="(node) in mainStore.profiles[mainStore.currentProfile].nodes"></note-pad-component>
    <div class="row items-center justify-center q-pa-sm q-ma-md" style="box-sizing: border-box; outline: 2px dashed rgba(0, 0, 0, 0.15); width: 50%;">
      <q-btn round icon="add" color="primary"></q-btn>
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
