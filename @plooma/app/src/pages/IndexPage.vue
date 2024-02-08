<template>
  <q-page class="row items-center justify-evenly">
    <SelectComponent 
      labelText="Select Profile"
      nodeValue="profiles"
    />
    <SelectComponent
      labelText="Select Story" 
      nodeValue="profiles"
    />
    <q-btn @click="createProfile" color="primary" :disable="isBeginBtnDisabled" label="begin"></q-btn>
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent,
} from 'vue';
import { useRouter } from 'vue-router';
import { useMainStore } from '../stores/mainStore';
import SelectComponent from 'src/components/SelectComponent.vue';

export default defineComponent({
  name: 'IndexPage',
  components: {
    SelectComponent
  },
  setup() {
    const mainStore = useMainStore();
    const router = useRouter();
    let isBeginBtnDisabled = false;

    const createProfile = async () => {
      try {
        isBeginBtnDisabled = true;
        await mainStore.createProfile({profileName: 'default'});
        router.push('/edit');
      } catch (e) {
        console.error(e);
        isBeginBtnDisabled = false;
      }
    };

    return {
      mainStore,
      createProfile,
      isBeginBtnDisabled
    };
  }
});
</script>
