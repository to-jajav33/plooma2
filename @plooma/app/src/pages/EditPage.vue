<template>
  <q-page class="row items-center justify-evenly">
    <q-editor></q-editor>
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ref
} from 'vue';
import { StateFactory } from '../boot/StateFactory';
import {MainState} from '../states/MainState';

export default defineComponent({
  name: 'IndexPage',
  components: { },
  setup() {
    const mainState = ref<MainState>(StateFactory.getStore(MainState));

    return {
      mainState,
    };
  }
});
</script>
