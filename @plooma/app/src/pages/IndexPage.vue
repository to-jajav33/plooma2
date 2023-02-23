<template>
  <q-page class="row items-center justify-evenly">
    <q-btn @click="createProfile" label="begin"></q-btn>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, 
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
ref } from 'vue';
import { StateFactory } from '../boot/StateFactory';
import {MainState} from '../states/MainState';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'IndexPage',
  components: { },
  setup() {
    const mainState: ref<MainState> = ref<MainState>(StateFactory.getStore(MainState));
    const router = useRouter();

    const createProfile = async () => {
      await mainState.value.createProfile({profileName: 'default'});
      router.push('/edit')
    }
    return {
      mainState,
      createProfile
    };
  }
});
</script>
