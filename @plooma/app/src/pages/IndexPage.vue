<template>
  <q-page class="row items-center justify-evenly">
    <q-btn @click="createProfile" label="begin"></q-btn>
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

    const createProfile = async () => {
      await mainStore.createProfile({profileName: 'default'});
      router.push('/edit')
    };

    return {
      mainStore,
      createProfile
    };
  }
});
</script>
