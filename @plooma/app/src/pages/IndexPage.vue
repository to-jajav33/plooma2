<template>
  <q-page class="row items-center justify-evenly">
    <q-btn @click="() => mainState.createProfile({profileName: 'default'})" label="begin"></q-btn>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { StateFactory } from '../boot/StateFactory';
import {MainState} from '../states/MainState';

export default defineComponent({
  name: 'IndexPage',
  components: { },
  setup() {
    const mainState: MainState = ref<MainState>(StateFactory.getStore(MainState));
    return {
      mainState,
    };
  }
});
</script>
