<template>
  <div>
    <q-input v-model="mainStore.profiles[mainStore.currentProfile].nodes[props.nodeUID].nodeTitle" filled dense></q-input>
    <q-editor @blur="onBlur" @focus="onFocus" v-model="text" :toolbar="shouldShowToolbar ? undefined : []"></q-editor>
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
    const text = mainStore.profiles[props.profileName].nodes[props.nodeUID].htmlText;
    let shouldShowToolbar = ref(false);
    return {
      text, props, mainStore, shouldShowToolbar,
      onFocus() {
        shouldShowToolbar.value = true;
      },
      onBlur() {
        shouldShowToolbar.value = false;
      }
    };
  },
});
</script>
