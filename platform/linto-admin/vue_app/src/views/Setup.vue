<template>
  <div id="app">
    <div id="login-bg"></div>
    <div id="login-wrapper" class="flex col">
      <div class="flex1 flex col login-form-container">
        <!-- Logo -->
        <img src="/assets/img/admin-logo-light@2x.png" alt="administration interface" class="login-logo">
        <div class="setup-form-container flex col">
          <h1>Welcome to Linto Admin</h1>
          <span class="info">LinTO Admin is a web interface that enables you to manage your LinTO stack deployment. You firstly need to create an “administrator” account to complete the setup and log in to your  LinTO Admin interface.</span>
          <!-- Name -->
          <AppInput :label="'Username'" :obj="user.name" :test="'testName'"></AppInput>
          <!-- Email -->
          <AppInput :label="'Email'" :obj="user.email" :test="'testEmail'"></AppInput>
          <!-- Password -->
          <AppInput :label="'Password'" :obj="user.password" :test="'testPassword'" :type="'password'"></AppInput>
          <!-- Password Confirmation -->
          <AppInput :label="'Password confirmation'" :obj="user.password_confirm" :test="'null'" :type="'password'"></AppInput>
          <!-- Submit -->
          <button
            class="button button-txt button--blue"
            @click="handleForm()"
          ><span class="button__label">Create user</span></button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import AppInput from '@/components/AppInput.vue'
import axios from 'axios'
export default {
  data () {
    return {
      user: {
        name: {
          value:'',
          error: null,
          valid: false
        },
        email: {
          value:'',
          error: null,
          valid: false
        },
        password: {
          value:'',
          error: null,
          valid: false
        },
        password_confirm: {
          value:'',
          error: null,
          valid: false
        }
      }
    }
  },
  computed: {
    formValid () {
      return (this.user.name.valid && this.user.email.valid && this.user.password.valid && this.user.password_confirm.valid)
    }
  },
  methods: {
    handleForm () {
      this.testName(this.user.name)
      this.testEmail(this.user.email)
      this.testPassword(this.user.password)
      this.testConfirmPassword()
      if (this.formValid) {
        this.sendForm()
      }
    },
    testName () {
      this.$options.filters.testName(this.user.name)
    },
    testEmail () {
      this.$options.filters.testEmail(this.user.email)
    },
    testPassword () {
      this.$options.filters.testPassword(this.user.password)
    },
    testConfirmPassword () {
      this.user.password_confirm.valid = false
      this.user.password_confirm.error = null
      if(this.user.password_confirm.value.length === 0) {
        this.user.password_confirm.error = 'This field is required'
      }
      else if(this.user.password.value !== this.user.password_confirm.value) {
        this.user.password_confirm.error = 'Confirmation password different from password'
      } else {
        this.user.password_confirm.valid = true
      }
    },
    async sendForm () {
      const payload = {
        name: this.user.name.value,
        email: this.user.email.value,
        password: this.user.password.value
      }
      const createUser = await axios(`${process.env.VUE_APP_URL}/setup/createuser`, {
        method: 'post',
        data: payload
      })
      if(createUser.data.status === 'success') {
        window.location.href = process.env.VUE_APP_URL + '/login'
      }
    }
  },
  components: {
    AppInput
  }
}
</script>
