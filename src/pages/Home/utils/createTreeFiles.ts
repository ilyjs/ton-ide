import {DirEnt, WebContainer} from "@webcontainer/api";
import {NodeModel} from "@minoru/react-dnd-treeview";
import {dataNodeModel} from "../../../store/FileStore.ts";
import path from "path-browserify";
import hash from 'hash-it';

function readDirectory(dirPath: string, webcontainerInstance:  WebContainer | undefined): Promise<DirEnt<string>[]> {
    return new Promise((resolve, reject) => {
        if(!webcontainerInstance) return;

        webcontainerInstance.fs.readdir(dirPath, { withFileTypes: true }  )
            .then((dirents) => resolve(dirents))
            .catch((error) => reject(error))
    })
}

export async function createTree(rootPath: string, exclude: string[] = [], webcontainerInstance: WebContainer | undefined) {
    const tree: NodeModel<dataNodeModel>[] = [];
    const idPathMap: {[k: string]: number} = {};
    let id = 0;

    async function traverseDirectory(dirPath: string, parentId = 0) {
        const dirents: DirEnt<string>[] = await readDirectory(dirPath, webcontainerInstance);
        if (!webcontainerInstance) return;
        for (const dirent of dirents) {
            if (exclude.includes(dirent.name)) {
                continue;
            }

            const fullPath = path.join(dirPath, dirent.name);
            idPathMap[fullPath] = id++;
            let node: NodeModel<dataNodeModel> = {
                id: id,
                parent: parentId,
                text: dirent.name,
                droppable: false,
                data: {
                    type: 'any',
                    value: ''
                }
            };

            let nodeHash = {
                parent: parentId,
                text: dirent.name,
                droppable: false,
                data: {
                    type: 'any',
                    value: ''
                }
            };

            if (dirent.isFile()) {
                const value = await webcontainerInstance.fs.readFile(fullPath, 'utf-8');
                nodeHash = {...nodeHash, droppable: false, data: {
                        ...node.data, type: 'file', value
                    }}
                const hashsum = hash(nodeHash);

                node = {
                    ...node,
                    droppable: false,
                    data: {
                        ...node.data, type: 'file', value: await webcontainerInstance.fs.readFile(fullPath, 'utf-8'), hash: hashsum
                    }
                };
            } else if (dirent.isDirectory()) {
                nodeHash = {
                    ...nodeHash,
                    droppable: true,
                    data: {
                        ...node.data,
                        value: '',
                        type: 'directory',
                    }
                }
                const hashsum = hash(nodeHash);
                node = {
                    ...node,
                    droppable: true,
                    data: {
                        ...node.data,
                        value: '',
                        type: 'directory',
                        hash: hashsum
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
