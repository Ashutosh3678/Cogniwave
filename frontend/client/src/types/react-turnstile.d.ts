declare module "react-turnstile" {
  import React from "react";
  interface TurnstileProps {
    sitekey: string;
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
  }
  const Turnstile: React.FC<TurnstileProps>;
  export default Turnstile;
}
