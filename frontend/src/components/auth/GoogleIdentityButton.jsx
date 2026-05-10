'use client';

import { useEffect, useEffectEvent, useRef } from 'react';
import { useGoogleOAuth } from '@react-oauth/google';

let initializedClientId = null;
let latestCredentialHandler = null;

const extractClientId = (credentialResponse) =>
  credentialResponse?.clientId ?? credentialResponse?.client_id ?? null;

export default function GoogleIdentityButton({
  onSuccess,
  onError,
  theme = 'outline',
  size = 'large',
  shape = 'rectangular',
  text = 'continue_with',
  locale = 'ar',
  width = 390,
}) {
  const buttonRef = useRef(null);
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();

  const handleCredential = useEffectEvent((credentialResponse) => {
    if (!credentialResponse?.credential) {
      onError?.();
      return;
    }

    onSuccess({
      credential: credentialResponse.credential,
      clientId: extractClientId(credentialResponse),
      select_by: credentialResponse.select_by,
    });
  });

  useEffect(() => {
    if (!scriptLoadedSuccessfully || !clientId || !buttonRef.current) return;

    const googleId = window.google?.accounts?.id;
    if (!googleId) return;
    const buttonElement = buttonRef.current;

    latestCredentialHandler = handleCredential;

    if (initializedClientId !== clientId) {
      googleId.initialize({
        client_id: clientId,
        callback: (credentialResponse) => {
          latestCredentialHandler?.(credentialResponse);
        },
      });
      initializedClientId = clientId;
    }

    buttonElement.innerHTML = '';
    googleId.renderButton(buttonElement, {
      theme,
      size,
      shape,
      text,
      locale,
      width,
    });

    return () => {
      if (latestCredentialHandler === handleCredential) {
        latestCredentialHandler = null;
      }

      buttonElement.innerHTML = '';
    };
  }, [clientId, locale, scriptLoadedSuccessfully, shape, size, text, theme, width]);

  return <div ref={buttonRef} style={{ minHeight: size === 'large' ? 40 : size === 'medium' ? 32 : 20 }} />;
}
