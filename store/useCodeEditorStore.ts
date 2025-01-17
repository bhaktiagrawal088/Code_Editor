import { CodeEditorState } from "@/types";
import {create} from "zustand";
import { Monaco } from "@monaco-editor/react";
import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";


const getInitialState = () => {
    // If we are on server, return default values
    if(typeof window === "undefined"){
        return {
            language : "javascript",
            fontSize : 16,
            theme : "vs-dark",
        }
    }

    // If we are on client, return values from th local storage bc localstorage is browser API
    const savedLanguage = localStorage.getItem("editor-language") || "javascript";
    const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
    const savedFontSize = localStorage.getItem("editor-font-size") || 16;

    return {
        language : savedLanguage,
        theme : savedTheme,
        fontSize : Number(savedFontSize),

    }
} 

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
    const intialState = getInitialState();

    return{
        ...intialState,
        output : "",
        isRunning : false,
        error : null,
        editor : null,
        executionResult : null,

        getCode : () => get().editor?.getValue() || "",

        setEditor : (editor:Monaco) => {
            const savedCode = localStorage.getItem(`editor-code-${get().language}`)
            if(savedCode) editor.setValue(savedCode);
            set({editor});
        },

        setTheme : (theme : string) => {
            localStorage.setItem("editor-theme", theme);
            set({theme})
        },

        setFontSize : (fontSize : number) => {
            localStorage.setItem("editor-font-size", fontSize.toString());
            set({fontSize})
        },

        setLanguage : (language : string) => {
            // Save current language code before switching
            const currentCode = get().editor?.getValue();
            if(currentCode) {
                localStorage.setItem(`editor-code-${get().language}`, currentCode)
            }

            localStorage.setItem("editor-language", language);

            set({
                language,
                output:"",
                error:null,
            });
        },

        runCode: async () =>{
            //todo
        }
    }
})