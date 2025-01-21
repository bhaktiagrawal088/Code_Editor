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
        const initialState = getInitialState();

        return{
            ...initialState,
            output : "",
            isRunning : false,
            error : null,
            editor : null,
            executionResult : null,

            getCode : () => get().editor?.getValue() || "",

            setEditor : (editor:Monaco) => {
                // const savedCode = localStorage.getItem(`editor-code-${get().language}`)
                // if(savedCode) editor.setValue(savedCode);
                // set({editor});

                 // Fetch the saved code from localStorage
                const savedCode = localStorage.getItem(`editor-code-${get().language}`);
                console.log("Saved Code:", savedCode);  // Debugging saved code
                
                // If there's no saved code, fall back to the default code from LANGUAGE_CONFIG
                const codeToSet = savedCode || LANGUAGE_CONFIG[get().language]?.defaultCode || "// Start coding here...";
                console.log("Code to Set:", codeToSet);  // Debugging final code to be set

                if (editor) {
                    editor.setValue(codeToSet);  // Set the editor value to the code
                }

                set({ editor });  // Set the editor instance in the store
            },

            setTheme : (theme : string) => {
                localStorage.setItem("editor-theme", theme);
            
                set({ theme });
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
                const {language, getCode} = get();
                const code = getCode();

                if(!code){
                    set({error : "Please enter some code"});
                }

                set({isRunning : true, error : null, output: ""})

                try {
                    const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
                    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                        method : "POST",
                        headers : {
                            "Content-Type" : "application/json"
                        },
                        body: JSON.stringify({
                            language: runtime.language,
                            version : runtime.version,
                            files : [{content: code}]
                        })
                    })

                    const data =  await response.json();
                    console.log ( "Data back from piston " ,data)
                    
                    //Handle API-level error
                    if(data.message){
                        set({error: data.message,
                            executionResult : {code, output : "", error: data.message}
                        })
                        return
                    }

                    // Handle compliation error
                    if(data.compile && data.compile.code !==0){
                        const error = data.compile.stderr || data.compile.output;
                        set({
                            error,
                            executionResult:{
                                code,
                                output : "",
                                error
                            }
                        })
                        return
                    }

                    // handle runtime error
                    if(data.run && data.run.code !== 0 ){
                        const error = data.run.stderr  || data.run.output;
                        set({
                            error,
                            executionResult:{
                                code,
                                output:"",
                                error
                            }
                        })
                        return
                    }

                    // execution was successful
                    const output = data.run.output;
                    set({
                        output: output.trim(),
                        error: null,
                        executionResult:{
                            code,
                            output : output.trim(),
                            error:null
                        }

                    })

        
                } catch (error) {
                    
                    console.log("Error running code" , error);
                    set({
                        error: "Error running code",
                        executionResult:{
                            code,
                            output : "",
                            error: "Error nunning code",
                        }
                    })
                }
                finally{
                    set({isRunning:false})
                }
            }
        }
    })

    export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;