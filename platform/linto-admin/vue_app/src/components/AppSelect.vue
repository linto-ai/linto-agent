<template>
  <div class="flex col">
    
    <AppFormLabel
      v-if="!noLabel"
      :noLabel="noLabel || false"
      :label="label || ''"
      :helperBtn="helperBtn || false"
      :helperBtnContent="helperBtnContent || false"
    ></AppFormLabel>

    <!-- Select field with checkbox option -->
    <div v-if="!!checkboxOptionEnabled && checkboxOptionEnabled === true" class="flex row form__checkbox-container">
        <input type="checkbox" 
          v-model="checkboxOptionValue" 
          :id="checkboxOptionId"
          checked
        >
          <span class="form__checkbox-label" @click="updateCheckbox()">{{ checkboxOptionLabel }}</span>
        <div class="flex1 flex col" >
          <select
            v-if="!type"
            class="form__select flex1"
            v-model="obj.value"
            :class="[
              obj.error !== null ? 'form__select--error' : '', 
              obj.valid ? 'form__select--valid' : ''
            ]"
            @change="testSelectField(obj)"
            :disabled="disabled || disabled2 || (!!checkboxOptionEnabled && checkboxOptionEnabled === true && !checkboxOptionValue) ? 'disabled' : false"
          >
            <option v-if="!!resetValue && resetValue === true" value="">None</option>
            <option 
              v-for="l in list"
              :key="l[params.key]"
              :value="l[params.value]"
            >{{ l[params.optLabel] }} </option>
              <option 
              v-for="l2 in list2"
              :key="l2[params.key]"
              :value="l2[params.value]"
              :disabled="'disabled'"
            >{{ l2[params.optLabel] }} (Generating...)</option>

            <option v-if="!!options" :value="options.value">{{ options.label }}</option>
          </select>
          <span class="form__error-field" v-if="disabled">{{ disabledTxt }}</span>
          <span class="form__error-field" v-if="!disabled && disabled2">{{ disabled2Txt }}</span>
          <span class="form__error-field" v-if="extraClass !== 'form__select--inarray'">{{ obj.error }}</span>
        </div>
    </div>

    <div class="flex col" v-else>
      <select
        v-if="!type"
        class="form__select"
        v-model="obj.value"
        :class="[
          obj.error !== null ? 'form__select--error' : '', 
          obj.valid ? 'form__select--valid' : ''
        ]"
        @change="testSelectField(obj)"
        :disabled="disabled || disabled2 || (!!checkboxOptionEnabled && checkboxOptionEnabled === true && !checkboxOptionValue) ? 'disabled' : false"
      >
        <option v-if="!!resetValue && resetValue === true" value="">None</option>
        <option 
          v-for="l in list"
          :key="l[params.key]"
          :value="l[params.value]"
        >{{ l[params.optLabel] }} </option>
          <option 
          v-for="l2 in list2"
          :key="l2[params.key]"
          :value="l2[params.value]"
          :disabled="'disabled'"
        >{{ l2[params.optLabel] }} (Generating...)</option>

        <option v-if="!!options" :value="options.value">{{ options.label }}</option>
      </select>
    

      <span class="form__error-field" v-if="disabled">{{ disabledTxt }}</span>
      <span class="form__error-field" v-if="!disabled && disabled2">{{ disabled2Txt }}</span>
      <span class="form__error-field" v-if="extraClass !== 'form__select--inarray'">{{ obj.error }}</span>
    </div>
  </div>
</template>
<script>

import AppFormLabel from '@/components/AppFormLabel.vue'
import { bus } from '../main.js'
export default {
  props: ['label','obj','list', 'list2','options','params', 'disabled', 'disabledTxt', 'disabled2', 'disabled2Txt', 'type', 'extraClass', 'noLabel', 'resetValue', 'checkboxOptionLabel', 'checkboxOptionEnabled', 'checkboxOptionId', 'checked', 'customEvent', 'helperBtn', 'helperBtnContent','settingsUpdate'],
  data () {
    return {
      checkboxOptionValue: false
    }
  },
  mounted () {
    if(!!this.checked && this.checked === true) {
      this.checkboxOptionValue = true
    }
  },
  watch: {
    checkboxOptionValue (data) {
      if(data === true && !this.disabled) {
        if(this.obj.value === '') {
          this.obj.value = this.list[0][this.params.value]
          this.obj.valid = true
        }
      } else if(data === false && !this.disabled) {
          this.obj.value = ''
          this.obj.error = null
          this.obj.valid = false
      }
      if(this.settingsUpdate) {
        bus.$emit('feature_update_settings', {})
      }
    },
    disabled (data) {
      if(!data && this.checkboxOptionValue === true) {
        this.obj.value = this.list[0][this.params.value] || ''
      }
    }
  },
  methods: {
    testSelectField (obj) {
      if(!this.resetValue) {
        this.$options.filters.testSelectField(obj)
      }
      if(this.settingsUpdate) {
        bus.$emit('feature_update_settings', {})
      }
     
    },
    updateCheckbox () {
      this.checkboxOptionValue = !this.checkboxOptionValue
    }
  }, 
  components: {
    AppFormLabel
  }
}
</script>
