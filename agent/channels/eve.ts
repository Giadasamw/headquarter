import { eveChannel } from "eve/channels/eve";
import { localDev, vercelOidc, type AuthFn } from "eve/channels/auth";
import { isValidSessionToken, readSessionCookie } from "../../lib/hq-auth";

// Accepts the browser only when it carries the HQ_PASSWORD session cookie set by /login.
function hqPassword(): AuthFn<Request> {
  return async (request) => {
    const token = readSessionCookie(request.headers.get("cookie"));
    if (!(await isValidSessionToken(token))) return null;
    return {
      attributes: {},
      authenticator: "hq-password",
      principalId: "giada",
      principalType: "user",
    };
  };
}

// vercelOidc() keeps eve's internal calls (like the daily wake-up) working.
// Anyone else without the cookie gets a 401.
export default eveChannel({
  auth: [vercelOidc(), hqPassword(), localDev()],
});
