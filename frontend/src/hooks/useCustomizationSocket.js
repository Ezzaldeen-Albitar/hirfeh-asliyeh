'use client';

import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { subscribeToSocket } from '@/lib/socketClient';
import {
  customizationsApi,
  normalizeCustomizationMessage,
} from '@/store/api/customizationsApi';

function getMessageKey(message) {
  if (message?._id) {
    return String(message._id);
  }

  return [
    message?.sender?._id || message?.sender || '',
    message?.sentAt || '',
    message?.content || message?.message || '',
  ].join(':');
}

function appendMessage(messages, incomingMessage) {
  const normalizedMessage = normalizeCustomizationMessage(incomingMessage);
  const incomingKey = getMessageKey(normalizedMessage);
  const alreadyExists = messages.some((message) => getMessageKey(message) === incomingKey);

  if (!alreadyExists) {
    messages.push(normalizedMessage);
  }

  return normalizedMessage;
}

function updateCustomizationDraft(draft, customizationId, incomingMessage) {
  if (!Array.isArray(draft)) {
    return;
  }

  const index = draft.findIndex((item) => String(item?._id) === customizationId);
  if (index === -1) {
    return;
  }

  const request = draft[index];
  const messages = Array.isArray(request.messages) ? request.messages : (request.messages = []);
  const normalizedMessage = appendMessage(messages, incomingMessage);
  request.updatedAt = normalizedMessage.sentAt || new Date().toISOString();

  if (index > 0) {
    const [updatedRequest] = draft.splice(index, 1);
    draft.unshift(updatedRequest);
  }
}

function updateSingleCustomizationDraft(draft, incomingMessage) {
  if (!draft || typeof draft !== 'object') {
    return;
  }

  const messages = Array.isArray(draft.messages) ? draft.messages : (draft.messages = []);
  const normalizedMessage = appendMessage(messages, incomingMessage);
  draft.updatedAt = normalizedMessage.sentAt || new Date().toISOString();
}

export function useCustomizationSocket(requestIds = []) {
  const dispatch = useDispatch();
  const customizationIds = useMemo(
    () => [...new Set((requestIds || []).filter(Boolean).map((id) => String(id)))],
    [requestIds]
  );

  useEffect(() => {
    if (customizationIds.length === 0) {
      return undefined;
    }

    let socket = null;

    const handleIncomingMessage = (payload) => {
      const customizationId = String(payload?.customizationId || '');
      if (!customizationId || !customizationIds.includes(customizationId)) {
        return;
      }

      dispatch(
        customizationsApi.util.updateQueryData('getCustomizations', undefined, (draft) => {
          updateCustomizationDraft(draft, customizationId, payload);
        })
      );

      dispatch(
        customizationsApi.util.updateQueryData('getCustomization', customizationId, (draft) => {
          updateSingleCustomizationDraft(draft, payload);
        })
      );
    };

    const syncSocket = (nextSocket) => {
      if (socket === nextSocket) {
        return;
      }

      if (socket) {
        socket.off('receive:message', handleIncomingMessage);
        customizationIds.forEach((id) => socket.emit('leave:customization', id));
      }

      socket = nextSocket;

      if (socket) {
        customizationIds.forEach((id) => socket.emit('join:customization', id));
        socket.on('receive:message', handleIncomingMessage);
      }
    };

    const unsubscribe = subscribeToSocket(syncSocket);

    return () => {
      unsubscribe();
      if (socket) {
        socket.off('receive:message', handleIncomingMessage);
        customizationIds.forEach((id) => socket.emit('leave:customization', id));
      }
    };
  }, [customizationIds, dispatch]);
}
