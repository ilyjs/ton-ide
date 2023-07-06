import {memo,  useRef, useState} from "react";
import NavBar from "../components/NavBar";
import {Main} from "./styles/Main.tsx";
import {WorkSpace} from "./styles/WorkSpace.tsx";
import ActionBar from "../components/ActionBar";
import DialogCreate from "../../components/DialogCreate";
import {useWebcontainers} from "../../hooks";
import FileBrowser from "../../containers/FileBrowser";
import EditorComponent from "../components/Editor";
import {rewireEditor} from "../../configEditor/config.ts"
import styled from "@emotion/styled";
import {Preview} from "./styles/Preview.ts";
import Terminal from "./terminal";
//import {WebContainer} from "@webcontainer/api";

import {Mosaic} from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import './styles/mosaic-custom-theme.css'
import {getBackendOptions, MultiBackend} from "@minoru/react-dnd-treeview";
import {DndProvider} from "react-dnd";
import path from "path-browserify";
import {useStore} from "../../store";
// import '@blueprintjs/core/lib/css/blueprint.css';
// import '@blueprintjs/icons/lib/css/blueprint-icons.css';




const LeftPanel = styled.div`
  height: 100%;
  width: 100%;
  background: #222;
`;

const Editor = styled.div`
  height: 100%;
  width: 100%;
`;

const WorkSpaceMosaic = styled.div`
  flex-grow: 1;
  position: relative;
`

interface INode {
    id: number | string,
    parent: number | string,
    text: string,
    droppable: boolean,
    data: {
        type: string,
        value: string
    }
}

export const Home = memo(() => {


    const [value, setValue] = useState<number>(0)
    const [deployNumber, setDeployNumber] = useState<number>(0);
    rewireEditor();
    const webcontainerInstance = useWebcontainers();
    const previewRef = useRef<HTMLDivElement>(null);

    const {
        setFiles,
    } = useStore().store.fileStore;

    function readDirectory(dirPath: string) {
        return new Promise((resolve, reject) => {
            if(!webcontainerInstance) return;

            webcontainerInstance.fs.readdir(dirPath, { withFileTypes: true }  )
                .then((dirents) => resolve(dirents))
                .catch((error) => reject(error))


        })

    }

    async function createTree(rootPath: string, exclude: string[] = []) {
        const tree: any[] = [];
        const idPathMap: any = {};
        let id = 0;

        async function traverseDirectory(dirPath: string, parentId = 0) {
            const dirents: any = await readDirectory(dirPath);
            if (!webcontainerInstance) return;
            for (const dirent of dirents) {
                if (exclude.includes(dirent.name)) {
                    continue;
                }

                const fullPath = path.join(dirPath, dirent.name);
                idPathMap[fullPath] = id++;
                let node: INode = {
                    id: id,
                    parent: parentId,
                    text: dirent.name,
                    droppable: false,
                    data: {
                        type: 'any',
                        value: ''
                    }
                };

                if (dirent.isFile()) {
                    node = {
                        ...node,
                        droppable: false,
                        data: {
                            ...node.data, type: 'file', value: await webcontainerInstance.fs.readFile(fullPath, 'utf-8')
                        }
                    };
                } else if (dirent.isDirectory()) {
                    node = {
                        ...node,
                        droppable: true,
                        data: {
                            ...node.data,
                            value: '',
                            type: 'directory',
                        }
                    };
                    await traverseDirectory(fullPath, id);
                }

                tree.push(node);


            }
        }

        await traverseDirectory(rootPath);
        return tree;
    }

    const fileSystemTreeCreate = async () => {
        if(webcontainerInstance) {
            const excludeItems = ['node_modules', '.gitignore', '.prettierignore', '.prettierrc', 'package-lock.json'];
            createTree( '/', excludeItems)
                .then(tree => {

                    console.log(JSON.stringify(tree, null, 2));
                    setFiles(tree);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            console.log(JSON.stringify(files));

        }

    }

    const build = () => {
        setValue(value + 1);
    }

    const deploy = () => {
        setDeployNumber(deployNumber + 1);
    }
    const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
        a: <LeftPanel>
            <FileBrowser webcontainerInstance={webcontainerInstance}/>
        </LeftPanel>,
        b: <Editor>
            <EditorComponent webcontainerInstance={webcontainerInstance}/>
        </Editor>,
        c: <Preview  ref={previewRef}>
            {
                webcontainerInstance ? <Terminal fileSystemTreeCreate={fileSystemTreeCreate} deployNumber={deployNumber} buildNumber={value} webcontainerInstance={webcontainerInstance}/> : ''
            }
        </Preview>,
    };
    const files = {
        'package.json': {
            file: {
                contents: `
        {
          "name": "vite-starter",
          "private": true,
          "version": "0.0.0",
          "type": "module",
          "scripts": {
            "dev": "vite",
            "build": "vite build",
            "preview": "vite preview"
          },
          "devDependencies": {
            "vite": "^4.0.4"
          }
        }`,
            },
        },
    };


    return (
        <Main>
            <DndProvider context={window} key={500} backend={MultiBackend} options={getBackendOptions()}>
                <NavBar/>

                <WorkSpace>
                    <ActionBar deploy={deploy} build={build} />
                    <WorkSpaceMosaic>
                        <Mosaic<string>
                            renderTile={(id) => ELEMENT_MAP[id]}
                            initialValue={{
                                direction: 'row',
                                first: 'a',
                                second: {
                                    direction: 'row',
                                    first: 'b',
                                    splitPercentage: 65,
                                    second: 'c',
                                },
                                splitPercentage: 25,
                            }}
                        />
                    </WorkSpaceMosaic>
                </WorkSpace>
                {/*<LeftPanel >*/}
                {/*    <FileBrowser webcontainerInstance={webcontainerInstance} />*/}
                {/*</LeftPanel>*/}
                {/*<Editor>*/}
                {/*    <EditorComponent/>*/}
                {/*</Editor>*/}
                {/*<Preview>*/}
                {/*    {*/}
                {/*        webcontainerInstance? <Terminal webcontainerInstance={webcontainerInstance} /> : ''*/}
                {/*    }*/}
                {/*</Preview>*/}
                <DialogCreate fileSystemTreeCreate={fileSystemTreeCreate} webcontainerInstance={webcontainerInstance}/>
            </DndProvider>
        </Main>
    );
})