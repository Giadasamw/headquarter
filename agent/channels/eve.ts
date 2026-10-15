import { eveChannel } from "eve/channels/eve";
import { localDev, none, vercelOidc } from "eve/channels/auth";

// No login for this test: none() makes the chat public once deployed.
export default eveChannel({
  auth: [vercelOidc(), localDev(), none()],
});
