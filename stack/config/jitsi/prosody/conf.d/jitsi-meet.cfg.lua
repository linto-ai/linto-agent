admins = {
  "focus@auth.meet.jitsi",
  "jvb@auth.meet.jitsi",
  "jigasi@auth.transcriber.meet.jitsi"
}

unlimited_jids = {
  "focus@auth.meet.jitsi",
  "jvb@auth.meet.jitsi",
  "jigasi@auth.transcriber.meet.jitsi"
}

plugin_paths = { "/prosody-plugins/", "/prosody-plugins-custom" }

muc_mapper_domain_base = "meet.jitsi";
muc_mapper_domain_prefix = "muc";

http_default_host = "meet.jitsi"


consider_bosh_secure = true;
consider_websocket_secure = true;

-- Deprecated in 0.12
-- https://github.com/bjc/prosody/commit/26542811eafd9c708a130272d7b7de77b92712de

cross_domain_websocket = { "https://${LINTO_STACK_JITSI_DOMAIN}","https://meet.jitsi" }
cross_domain_bosh = { "https://${LINTO_STACK_JITSI_DOMAIN}","https://meet.jitsi" }


VirtualHost "meet.jitsi"

  authentication = "jitsi-anonymous"

  ssl = {
      key = "/config/certs/meet.jitsi.key";
      certificate = "/config/certs/meet.jitsi.crt";
  }
  modules_enabled = {
      "bosh";
      
      "websocket";
      "smacks"; -- XEP-0198: Stream Management
      
      "pubsub";
      "ping";
      "speakerstats";
      "conference_duration";
  }

  speakerstats_component = "speakerstats.meet.jitsi"
  conference_duration_component = "conferenceduration.meet.jitsi"

  c2s_require_encryption = false

VirtualHost "auth.meet.jitsi"
  ssl = {
      key = "/config/certs/auth.meet.jitsi.key";
      certificate = "/config/certs/auth.meet.jitsi.crt";
  }
  modules_enabled = {
      "limits_exception";
  }
  authentication = "internal_hashed"


VirtualHost "recorder.meet.jitsi"
  modules_enabled = {
    "ping";
  }
  authentication = "internal_hashed"


Component "internal-muc.meet.jitsi" "muc"
  storage = "memory"
  modules_enabled = {
      "ping";
      }
  restrict_room_creation = true
  muc_room_locking = false
  muc_room_default_public_jids = true

Component "muc.meet.jitsi" "muc"
  storage = "memory"
  modules_enabled = {
      "muc_meeting_id";
      "polls";
      }
  muc_room_cache_size = 1000
  muc_room_locking = false
  muc_room_default_public_jids = true

Component "focus.meet.jitsi" "client_proxy"
  target_address = "focus@auth.meet.jitsi"

Component "speakerstats.meet.jitsi" "speakerstats_component"
  muc_component = "muc.meet.jitsi"

Component "conferenceduration.meet.jitsi" "conference_duration_component"
  muc_component = "muc.meet.jitsi"



VirtualHost "auth.transcriber.meet.jitsi"
  authentication = "internal_hashed" --"internal_plain"
  
  ssl = {
      key = "/config/certs/meet.jitsi.key";
      certificate = "/config/certs/meet.jitsi.crt";
  }
  c2s_require_encryption = false

Component "muc.transcriber.meet.jitsi" "muc"
  storage = "memory"
  modules_enabled = {
      "muc_meeting_id";
      "polls";
      }
  muc_room_cache_size = 1000
  muc_room_locking = false
  muc_room_default_public_jids = true


