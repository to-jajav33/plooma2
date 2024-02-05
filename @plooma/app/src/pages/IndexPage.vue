<template>
  <q-page class="row items-center justify-evenly">
    <q-select
      v-model="model" 
      filled 
      use-input
      input-debounce="0"
      label="Profiles"
      :options="options"
      style="width: 250px"
      @filter="filterFn"
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
import {
  defineComponent,
  ref
} from 'vue';
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

    const loadProfiles = () => {
      const profiles = []; 

      for (const profile in mainStore.profiles) {
        profiles.push(profile)
      }

      return profiles
    }
    const options = ref(loadProfiles());

    return {
      model: ref(null),
      mainStore,
      createProfile,
      isBeginBtnDisabled,
      loadProfiles,
      options,

      filterFn(val, update) {
        if (val === '') {
          update(() => {
            options.value = loadProfiles()
          })
          return
        }

        update(() => {
          const needle = val.toLowerCase()
          options.value = loadProfiles().filter(v => v.toLowerCase().indexOf(needle) > -1)
        })
      }
    };
  }
});
</script>
