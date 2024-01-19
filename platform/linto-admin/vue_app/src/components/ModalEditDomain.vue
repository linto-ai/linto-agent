<template>
  <div class="modal-wrapper" v-if="modalVisible && dataLoaded && webappHost !== null">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Edit domain</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <!-- End HEADER -->
      <!-- BODY -->
      <div class="modal-body flex col">
        <div class="modal-body__content flex col">
          <span class="subtitle" v-if="!addAppFormVisible">Domain informations</span>

          <div class="flex row" v-if="!addAppFormVisible">
            <AppInput :label="'Origin URL'" :obj="originUrl" :test="'testUrl'" :class="'flex1'"></AppInput>
            <div class="flex1 row">
              <button
                class="button button-icon-txt button--green"
                style="margin: 23px 0 0 10px"
                @click="updateHostUrl()"
              >
                <span class="button__icon button__icon--save"></span>
                <span class="button__label">Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- End BODY -->
      <!-- FOOTER -->
      <!-- End FOOTER -->
    </div>
  </div>
</template>
<script>
import AppInput from "@/components/AppInput.vue";
import { bus } from "../main.js";
import axios from "axios";
import randomstring from "randomstring";
export default {
  data() {
    return {
      modalVisible: false,
      webappHostId: null,
      selectedApps: [],
      selectedAppsIds: [],
      addAppFormVisible: false,
      applicationWorkflowsLoaded: false,
      webappHostsLoaded: false,
      originUrl: {
        value: "",
        error: null,
        valid: false
      },
      editingIds: [],
      editingObj: []
    };
  },
  async mounted() {
    bus.$on("edit_webapp_host", async data => {
      this.showModal()
      await this.refreshStore()
      this.webappHostId = data.webappHost._id
      this.originUrl.value = data.webappHost.originUrl
      this.originUrl.valid = true
    });
  },
  computed: {
    dataLoaded() {
      return this.webappHostsLoaded
    },
    webappHosts() {
      return this.$store.state.webappHosts
    },
    webappHost() {
      if (this.webappHostId !== null) {
        return this.$store.getters.WEB_APP_HOST_BY_ID(this.webappHostId)
      } else {
        return null
      }
    }
  },
  methods: {
    showModal() {
      this.modalVisible = true
      this.originUrl = {
        value: "",
        error: null,
        valid: false
      }
    },
    closeModal() {
      this.modalVisible = false
    },
    async updateHostUrl() {
      try {
        this.$options.filters.testUrl(this.originUrl)
        if (this.originUrl.valid) {
          const payload = {
            _id: this.webappHost._id,
            originUrl: this.originUrl.value
          }
          await this.updateWebappHost(payload)
        }
      } catch (error) {
        bus.$emit("app_notif", {
          status: "error",
          msg: error,
          timeout: false,
          redirect: false
        });
      }
    },
    async updateWebappHost(payload) {
      try {
        const updateWebappHost = await axios(`${process.env.VUE_APP_URL}/api/webapphosts/${payload._id}`, {
            method: "put",
            data: { payload }
        })
        if (updateWebappHost.data.status === "success") {
          bus.$emit("app_notif", {
            status: "success",
            msg: updateWebappHost.data.msg,
            timeout: 3000,
            redirect: false
          });
          await this.refreshStore()
          this.closeModal()
        } else {
          throw updateWebappHost.data.msg;
        }
      } catch (error) {
        bus.$emit("app_notif", {
          status: "error",
          msg: !!error.msg ? error.msg : error,
          timeout: false,
          redirect: false
        });
      }
    },

    async refreshStore() {
      try {
        await this.dispatchStore("getWebappHosts");
        await this.dispatchStore("getMultiUserApplications");
      } catch (error) {
        bus.$emit("app_notif", {
          status: "error",
          msg: error,
          timeout: false,
          redirect: false
        });
      }
    },
    async dispatchStore(topic) {
      try {
        const dispatch = await this.$options.filters.dispatchStore(topic);
        const dispatchSuccess = dispatch.status == "success" ? true : false;
        if (dispatch.status === "error") {
          throw dispatch.msg;
        }
        switch (topic) {
          case "getWebappHosts":
            this.webappHostsLoaded = dispatchSuccess;
            break;
          default:
            return;
        }
      } catch (error) {
        bus.$emit("app_notif", {
          status: "error",
          msg: error,
          timeout: false,
          redirect: false
        });
      }
    }
  },
  components: {
    AppInput
  }
};
</script>