import { createContext, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({children}) {
    const [toast, setToast] = useState(null);

    const showToast = (message, type ="success") => {
        setToast({message, type});
        setTimeout(() => setToast(null), 2500);
    };

    return (
        <ToastContext.Provider value={{showToast}}>
            {children}
            {toast && (
                <div
                    className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
                    >
                        {toast.message}
                    </div>
            )}
        </ToastContext.Provider>
    );
}
export function useToast() {
    return useContext(ToastContext);
}