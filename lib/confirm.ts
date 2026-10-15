import Swal from "sweetalert2";
import type { SweetAlertIcon } from "sweetalert2";

/**
 * Shared SweetAlert2 helpers themed to the CILab palette.
 * Styles live in `app/globals.css` (see the "SweetAlert2" section).
 */

export interface ConfirmOptions {
    title: string;
    text?: string;
    icon?: SweetAlertIcon;
    confirmText?: string;
    cancelText?: string;
    tone?: "default" | "danger";
}

export async function confirmAction({
    title,
    text,
    icon = "question",
    confirmText = "Confirm",
    cancelText = "Cancel",
    tone = "default",
}: ConfirmOptions): Promise<boolean> {
    const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        buttonsStyling: false,
        reverseButtons: true,
        focusCancel: true,
        background: "#F4F3EE",
        color: "#25251F",
        backdrop: "rgba(31, 50, 28, 0.5)",
        customClass:
            tone === "danger"
                ? { confirmButton: "cil-swal-danger" }
                : undefined,
    });

    return Boolean(result.isConfirmed);
}

export async function showAlert({
    title,
    text,
    icon = "info",
    confirmText = "OK",
}: {
    title: string;
    text?: string;
    icon?: SweetAlertIcon;
    confirmText?: string;
}): Promise<void> {
    await Swal.fire({
        title,
        text,
        icon,
        confirmButtonText: confirmText,
        buttonsStyling: false,
        background: "#F4F3EE",
        color: "#25251F",
        backdrop: "rgba(31, 50, 28, 0.5)",
    });
}
