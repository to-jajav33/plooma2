<template>
  <q-page class="row items-center justify-evenly">
    <q-select
      filled
      v-model="model"
      use-input
      input-debounce="0"
      label="Simple filter"
      options="options"
      @filter="filterFn"
      style="width: 250px"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            No results
          </q-item-section>
        </q-item>
      </template>
    </q-select>
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
