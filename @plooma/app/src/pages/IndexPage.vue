<template>
  <q-page class="row items-center justify-evenly">
    <q-btn @click="createProfile" color="primary" :disable="isBeginBtnDisabled" label="begin"></q-btn>
  </q-page>
</template>

<script lang="ts">
import { defineComponent} from 'vue';
import { useRouter } from 'vue-router';
import { useMainStore } from '../stores/mainStore';

export default defineComponent({
  name: 'IndexPage',
  components: { },
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
