<template>
  <q-editor v-model="text"></q-editor>
</template>

<script lang="ts">
import {
  defineComponent,
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
    },
  },
  setup(props) {
    const mainStore = useMainStore();
    const text = mainStore.profiles[props.profileName].nodes[props.nodeUID].htmlText;

    return {text};
  },
});
</script>
