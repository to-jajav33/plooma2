<template>
  <q-select
    v-model="model" 
    filled 
    use-input
    input-debounce="0"
    :label="labelText"
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
</template>

<script>
import {
  defineComponent,
  ref
} from 'vue';
import { useMainStore } from '../stores/mainStore';

export default defineComponent({
  name: 'SelectComponent',
  props: {
    labelText: {
      type: String,
      default: ''
    },
    nodeValue: {
      type: String, 
      default: null
    }
  },

  setup(props) {
    const mainStore = useMainStore();

    const loadProfiles = () => {
      const profiles = [];

      for (const item in mainStore[props.nodeValue]) {
        profiles.push(item)
      }

      return profiles
    }
    const options = ref(loadProfiles());

    return {
      model: ref(null),
      mainStore,
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
})
</script>