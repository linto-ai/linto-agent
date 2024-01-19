<template>
  <div id="app">
    <div id="login-bg"></div>
    <div id="login-wrapper" class="flex col">
      <div class="flex1 flex col login-form-container">
        <!-- Logo -->
        <img src="/assets/img/admin-logo-light@2x.png" alt="administration interface" class="login-logo">
        <div class="flex col">
          <!-- Login -->
          <input
            type="text"
            v-model="loginName.value"
            class="form__input form__input--login name"
            :class="loginName.error ? 'error' : ''"
            placeholder="login"
            @keyup.13="handleForm()"
            @blur="testName()"
          />
          <span class="form__error-field">{{ loginName.error }}</span>
        </div>
        <div class="flex col">
          <!-- Password -->
          <input
            type="password"
            v-model="loginPswd.value"
            class="form__input form__input--login pswd"
            :class="loginPswd.error ? 'error' : ''"
            placeholder="password"
            @keyup.13="handleForm()"
            @blur="testPassword()"
          />
          <span class="form__error-field">{{ loginPswd.error }}</span>
        </div>
        <div class="flex col">
          <!-- Submit -->
          <button
            class="button button--full button--blue"
            :class="formValid ? 'button--login-enabled' : 'button--login-disabled'"
            @click="handleForm()"
          ><span class="button__label">Login</span></button>
          <span style="padding-top:5px;" class="form__error-field">{{ loginError }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  data () {
    return {
      loginName: {
        value: '',
        error: null,
        valid: false
      },
      loginPswd: {
        value: '',
        error: null,
        valid: false
      },
      loginError: null
    }
  },
  computed: {
    formValid () {
      return (this.loginName.valid && this.loginPswd.valid)
    }
  },
  methods: {
    handleForm () {
      this.testName()
      this.testPassword()

      if (this.formValid) {
        this.sendForm()
      }
    },
    testName () {
      if (this.loginName.value.length === 0) {
        this.loginName.valid = false
        this.loginName.error = 'This field is required'
      } else {
        this.loginName.valid = true
        this.loginName.error = null
      }
    },
    testPassword () {
      if (this.loginPswd.value.length === 0) {
        this.loginPswd.valid = false
        this.loginPswd.error = 'This field is required'
      } else {
        this.loginPswd.valid = true
        this.loginPswd.error = null
      }
    },
    async sendForm () {
      this.loginError = null
      const payload = {
        userName: this.loginName.value,
        password: this.loginPswd.value
      }

      let userAuth = await axios(`${process.env.VUE_APP_URL}/login/userAuth`, {
        method: 'post',
        data: payload
      })
      if (userAuth.data.status === 'success') {
        window.location.href = process.env.VUE_APP_URL + '/admin/applications/device'
      } else {
        this.loginError = "The login/password combination is invalid."
      }
    }
  }
}
</script>
