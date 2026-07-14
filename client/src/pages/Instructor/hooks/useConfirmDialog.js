import { useState, useCallback } from "react";

/**
 * useConfirmDialog
 * Manages the state for an inline confirmation dialog.
 * Returns confirmDialog state and an openConfirm helper to trigger it.
 */
export function useConfirmDialog() {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const openConfirm = useCallback(({ title, message, onConfirm }) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmDialog((d) => ({ ...d, isOpen: false }));
  }, []);

  return { confirmDialog, openConfirm, closeConfirm };
}
