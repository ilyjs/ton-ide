import {memo, useRef, useState} from "react";
import NavBar from "../components/NavBar";
import ActionBar from "../components/ActionBar";
import DialogCreate from "../../components/DialogCreate";
import {useWebcontainers, useEditor} from "../../hooks";
import FileBrowser from "../../containers/FileBrowser";
import EditorComponent from "../components/Editor";
import Terminal from "./terminal";
import {Mosaic} from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import './styles/mosaic-custom-theme.css'
import {getBackendOptions, MultiBackend} from "@minoru/react-dnd-treeview";
import {DndProvider} from "react-dnd";
import {useStore} from "../../store";
import {createTree} from './utils/createTreeFiles.ts'
import {Editor, LeftPanel, Main, Preview, WorkSpace, WorkSpaceMosaic} from './styles'

export const Home = memo(() => {
    const [command, setCommand] = useState<string | undefined>('');
    const [isTerminalRestarted, setIsTerminalRestarted] = useState<boolean>(true);

    useEditor();
    const webcontainerInstance = useWebcontainers();
    const previewRef = useRef<HTMLDivElement>(null);

    const {
        setFiles,
        rootDirectory, setSelectedNode
    } = useStore().store.fileStore;

    const runCommandTerminal = (command?: string) => {
        setCommand(command);
        setIsTerminalRestarted(false);
    }

    const fileSystemTreeCreate = async (excludeItems: string[] = ['node_modules', '.gitignore', '.prettierignore', '.prettierrc', 'package-lock.json']) => {
        if (webcontainerInstance) {
            createTree('/', excludeItems, webcontainerInstance)
                .then(tree => {
                    setFiles(tree);
                    setSelectedNode(null);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }

    const build = () => {
        runCommandTerminal(`npx blueprint build\n`);
    }

    const deploy = () => {
        runCommandTerminal(`npx blueprint run\n`);
    }

    const runTest = () => {
        runCommandTerminal(`npx blueprint test\n`);
    }

    const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
        leftPanel: <LeftPanel>
            <FileBrowser webcontainerInstance={webcontainerInstance}/>
        </LeftPanel>,
        editor: <Editor>
            <EditorComponent webcontainerInstance={webcontainerInstance}/>
        </Editor>,
        preview: <Preview ref={previewRef}>
            {
                webcontainerInstance ?
                    <Terminal command={command} isTerminalRestarted={isTerminalRestarted}
                              setIsTerminalRestarted={setIsTerminalRestarted}
                              fileSystemTreeCreate={fileSystemTreeCreate}
                              webcontainerInstance={webcontainerInstance}
                              rootDirectory={rootDirectory}/> : ''
            }
        </Preview>,
    };

    return (
        <Main>
            <DndProvider context={window} key={500} backend={MultiBackend} options={getBackendOptions()}>
                <NavBar/>
                <WorkSpace>
                    <ActionBar runTest={runTest} deploy={deploy} build={build}/>
                    <WorkSpaceMosaic>
                        <Mosaic<string>
                            renderTile={(id) => ELEMENT_MAP[id]}
                            initialValue={{
                                direction: 'row',
                                first: 'leftPanel',
                                second: {
                                    direction: 'row',
                                    first: 'editor',
                                    splitPercentage: 65,
                                    second: 'preview',
                                },
                                splitPercentage: 25,
                            }}
                        />
                    </WorkSpaceMosaic>
                </WorkSpace>
                <DialogCreate fileSystemTreeCreate={fileSystemTreeCreate} webcontainerInstance={webcontainerInstance}/>
            </DndProvider>
        </Main>
    );
})