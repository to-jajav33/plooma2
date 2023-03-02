<template>
  <div>
    <q-input @update:model-value="onChangeSave" v-model="mainStore.profiles[mainStore.currentProfile].nodes[props.nodeUID].nodeTitle" filled dense></q-input>
    <q-editor @update:model-value="onChangeSave" @blur="onBlur" @focus="onFocus" v-model="mainStore.profiles[props.profileName].nodes[props.nodeUID].htmlText" :toolbar="shouldShowToolbar ? undefined : []"></q-editor>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ref
} from 'vue';
import { useMainStore } from '../stores/mainStore';
import { debounce } from 'quasar';

export default defineComponent({
  name: 'NotePadComponent',
  props: {
    profileName: {
      type: String,
      required: true
    },
    nodeUID: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const mainStore = useMainStore();
    let shouldShowToolbar = ref(false);
    let lastSavePromise = Promise.resolve();
    const onChangeSave = debounce(() => {
        // queue save request
        lastSavePromise = new Promise((resolve) => {
          const old_lastPromise = lastSavePromise;
          old_lastPromise.then(() => mainStore.saveLocal());
          resolve();
        });
    }, 500);

    return {
      props, mainStore, shouldShowToolbar,
      onFocus() {
        shouldShowToolbar.value = true;
      },
      onBlur() {
        shouldShowToolbar.value = false;
      },
      onChangeSave
    };
  },
});
</script>
