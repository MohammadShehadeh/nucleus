import { Resend } from "resend";

import { emailEnv } from "../env";

const env = emailEnv();
const resendToken = env.RESEND_TOKEN;

export const resend = new Resend(resendToken);
