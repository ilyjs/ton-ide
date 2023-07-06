import {useEffect, useRef, useState} from "react";
import Editor from "@monaco-editor/react";

import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
 import styled from "@emotion/styled";

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import {observer} from "mobx-react-lite";
import { useStore } from '../../../store';
import {WebContainer} from "@webcontainer/api";

//import * as monaco from "monaco-editor";




self.MonacoEnvironment = {
    createTrustedTypesPolicy: () => undefined,
    getWorker(_: unknown, label: string) {
        if (label === 'json') {
            return new jsonWorker();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new cssWorker();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new htmlWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
            return new tsWorker();
        }
        return new editorWorker();
    },
};

loader.config({ monaco });

loader.init().then((monaco) => console.log('here is the monaco instance:', monaco));

const Wrap = styled.div`
  display: flex;
`

export const EditorComponent = observer (  ({webcontainerInstance}: { webcontainerInstance: WebContainer | undefined }) => {
    const {   selectFile,files , changeFile} = useStore().store.fileStore;
    const [typeFile, setTypeFile] = useState('func');

    const getFileExtension = (nameFile: string) => {
        const splitFile = nameFile.split('.');
        return splitFile[splitFile.length - 1];
    };

    const getFileLanguage = (nameFile: string) => {
        const fileType = getFileExtension(nameFile);
        if (fileType === 'ts') return 'typescript';
        else if (fileType === 'fc') return 'func';
        else return 'text';
    };
    useEffect(() => {
        setTypeFile(getFileLanguage(selectFile?.text?? ''))
        console.log("selectFile", selectFile);

    }, [selectFile])

    const editorRef = useRef(null);

    function handleEditorDidMount(editor: any) {
        editorRef.current = editor;
    }

    const saveFile = async (path: string, value?: string) => {
        if (webcontainerInstance) {
            await webcontainerInstance.fs.writeFile(path, value ?? '', {encoding: 'utf-8'});
        }
    }


    function getFileById(files: any, id: number | string) {
        return files.find((file: any) => file.id === id);
    }

    function getFilePath(files: any, nameFile: string, parent: number | string): string {
        if (parent === 0) return `./${nameFile}`;

        const file = getFileById(files, parent);
        if (!file) {
            throw new Error(`File with id ${parent} not found`);
        }

        const parentPath = getFilePath(files, file.text, file.parent);
        return `${parentPath}/${nameFile}`;
    }

    function handleEditorChange( value: string | undefined) {
        if(files) {
            const id = selectFile?.id
            const index = files?.findIndex(file => file.id == id);
            if (selectFile?.data) {
                const data = {...selectFile?.data, value}
                const file = {...selectFile, data}
                changeFile(file, index);

                const path = getFilePath(files, selectFile?.text, selectFile?.parent);
                saveFile(path, value);
            }
        }
    }

    return (
        <Wrap>

            <Editor
                path={String(selectFile?.id)?? ''}
                value={selectFile?.data?.value?? ''}
                theme="vs-dark"
                height="100vh"
                defaultLanguage={selectFile?.text? getFileLanguage(selectFile?.text): 'text'}
                language={typeFile}
                onChange={handleEditorChange}
                defaultValue="// ton ide alpha-0.10"
                onMount={handleEditorDidMount}
            />

        </Wrap>
    );
});