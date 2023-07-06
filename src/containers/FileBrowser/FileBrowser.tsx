import React from 'react';
//import {DndProvider} from 'react-dnd';
import {
    Tree,
   /// MultiBackend,
 //   getBackendOptions,
    NodeModel, DropOptions,
} from '@minoru/react-dnd-treeview';
//import {CustomData} from './components/types';
import {CustomNode} from './components/CustomNode';
import {useStore} from '../../store';
import {observer} from 'mobx-react-lite';
//import newFiles from '../../filesNew';
import FileCreator from '../FileCreator';
import './components/styles/style.css';
import {NativeTypes} from 'react-dnd-html5-backend';
import {toJS} from "mobx";
import {WebContainer} from "@webcontainer/api";
import {dataNodeModel} from '../../store/FileStore.ts'

//initFile(files,['./01-simple-example', './02-nft-example']);
//initFile2(filesJSON);

// interface IFile  {
//
// id: number | string,
//     parent: number | string,
//     text: string,
//     droppable?: boolean,
//     data: {
//         value?: string,
//         path?: string
//         type: string
//     }
//
// }

export const FileBrowser = observer(({webcontainerInstance}: { webcontainerInstance: WebContainer | undefined }) => {
    const {
        files,
        setFiles,
        setSelectedNode,
        selectedNode,
        lastId,
        setLastId,
       // changeFileName,
        deleteFile,
    } = useStore().store.fileStore;

    const saveFile = async (path: string, value?: string) => {
        if (webcontainerInstance) {
            await webcontainerInstance.fs.writeFile(path, value ?? '', {encoding: 'utf-8'});
        }
    }

    const createNewFolder = async (path: string) => {
        if (webcontainerInstance) {
            await webcontainerInstance.fs.mkdir(path, {recursive: true});
        }
    }
    const removeFile = async (path: string) => {
        if (webcontainerInstance) {
            await webcontainerInstance.fs.rm(path, {recursive: true});

        }
    }
    const moveFile = async (oldPath: string, newPath: string, value?: string) => {
        await saveFile(newPath, value);
        await removeFile(oldPath);
    }

    // const moveFolder = async (oldPath: string, newPath: string) => {
    //     await createNewFolder(newPath);
    //     await removeFile(oldPath);
    // }


    // const getFileExtension = (nameFile: string) => {
    //     const splitFile = nameFile.split('.');
    //     return splitFile[splitFile.length - 1];
    // };

    // const getFileLanguage = (nameFile: string) => {
    //     const fileType = getFileExtension(nameFile);
    //     if (fileType === 'ts') return 'typescript';
    //     else if (fileType === 'fc') return 'func';
    //     else return 'text';
    // };

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


    // function getAllChildren(id: number) {
    //
    // }

    async function renameDirectory(directory: any, files: any, index: any, oldPath: string){
       await removeFile(oldPath);
       files[index] = directory;
       await collectDirectory(directory, files, files);
    }

    async function md(directory: any, files: any, newFiles: any){
        const id = directory.id;
        const oldFile = files.filter((file: any) => file.id === id)[0];
        const oldPath = getFilePath(files, oldFile.text, oldFile.parent);
        await removeFile(oldPath);
        await collectDirectory(directory, files, newFiles)
    }

    async function collectDirectory(directory: any, files: any, newFiles: any) {
        const id = directory.id;
        const file = newFiles.filter((file: any) => file.id === id)[0];
        const path = getFilePath(newFiles, file.text, file.parent);
        await createNewFolder(path);
       // const filesInOld = files.filter((file: any) => file.parent === id);
        const filesInNew = newFiles.filter((file: any) => file.parent === id);
        for (let i = 0; filesInNew.length > i; i++) {
            if (filesInNew[i].data.type === 'file') {
                const newPatch = getFilePath(newFiles, filesInNew[i].text, filesInNew[i].parent);
                await saveFile(newPatch, filesInNew[i].data.value);
            } else {
                await collectDirectory(filesInNew[i], files, newFiles);
            }
        }
    }

    function extractNameAndIndex(fileName: string) {
        const match = fileName.match(/^(.+?)(?:\((\d+)\))?(\.[^.]+)?$/);
        if (!match) {
            throw new Error('Invalid file name format');
        }

        const baseName = match[1];
        const index = match[2] ? parseInt(match[2], 10) : 0;
        const extension = match[3] ? match[3] : '';

        return {baseName, index, extension};
    }

    function generateUniqueName(files: any, fileName: string) {
        const {baseName, index, extension} = extractNameAndIndex(fileName);

        let newIndex = index;
        let uniqueName = fileName;
        let isUnique = false;

        while (!isUnique) {
            isUnique = true;

            for (const file of files) {
                if (file.text === uniqueName) {
                    isUnique = false;
                    newIndex++;
                    uniqueName = extension
                        ? `${baseName}(${newIndex})${extension}`
                        : `${baseName}(${newIndex})`;
                    break;
                }
            }
        }

        return uniqueName;
    }

    // const changeDuplicateName = (name: string) => {
    //   console.log('changeDuplicateName');
    //   const nameParts = name.split('.');
    //   if (nameParts.length === 1) return name + 1;
    //   nameParts[nameParts.length - 2] = nameParts[nameParts.length - 2] + '1';
    //   return nameParts.join('.');
    // };

    function isNameMatchCheck(files: any, nameFile: string, parent: string | number): boolean {
        if (!nameFile ?? !parent ?? !files) {
            throw new Error('Missing argument: nameFile, parent, or files is undefined');
        }
        files = files ?? []
        const folderFiles = files.filter((file: any) => parent === file.parent);
        return folderFiles.some((file: any) => file.text === nameFile);
    }

    const handleDrop = async (newTree: NodeModel<dataNodeModel>[], options: DropOptions) => {
        let {dropTargetId} = options;
        const {monitor} = options;
        dropTargetId = dropTargetId ? dropTargetId : 1;
        const itemType = monitor.getItemType();
        if (itemType === NativeTypes.FILE) {
            const uploadFiles: File[] = monitor.getItem().files;
            const nodes: NodeModel<dataNodeModel>[] = [];
            for (let i = 0; i < uploadFiles.length; i++) {
                let value = '';
                let fileName = uploadFiles[i].name;
                await uploadFiles[i].text().then((text) => (value = text));
                //const language = getFileLanguage(fileName);
                const isNameMatch = isNameMatchCheck(files, fileName, dropTargetId);
                if (isNameMatch) fileName = generateUniqueName(newTree, fileName);

                const path = getFilePath(files, fileName, dropTargetId);

                await saveFile(path, value);

                nodes.push({
                    id: lastId + 1,
                    parent: dropTargetId,
                    text: fileName,
                    data: {
                        path: path,
                        type: 'file',
                        //fileType: language,
                       // language,
                        value,
                    },
                });
            }

            const mergedTree = [...newTree, ...nodes];


            setFiles(mergedTree);
            setLastId(lastId + uploadFiles.length);
        } else {
            const id = monitor.getItem().id;
            console.log("newTree", newTree);


            const index = newTree.findIndex(item => item.id === id);
            let dropFile = newTree[index];
            console.log('dropFile', dropFile)
            let fileName = dropFile.text;
            const oldIndex = files?.findIndex(item => item.id === id);
            let oldTarget: string | number = 1;
            if (files && oldIndex) oldTarget = files[oldIndex].id;
            const dropFileOld = files?.filter(file => file.id === id)[0];
            console.log({dropFileOld})
            const currentPath = getFilePath(files, fileName, oldTarget);
            console.log("currentPath", currentPath);
            console.log("files", toJS(files));

            const isNameMatch = isNameMatchCheck(files, fileName, dropTargetId);
            if (isNameMatch) fileName = generateUniqueName(newTree, fileName);

            const path = getFilePath(files, fileName, dropTargetId);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (dropFileOld && dropFileOld.data && dropFileOld.data.type === 'file') {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                await moveFile(currentPath, path, dropFile.data.value);

                dropFile = {...dropFile, text: fileName, data: {...dropFileOld.data, path}};
                console.log("loto", dropFile)
            } else {

                dropFile = {...dropFile, text: fileName, data: {path, type: 'directory'}};
                await md(dropFile, files, newTree);
                console.log('dropFile folder', dropFile)

            }

            newTree[index] = dropFile;
            setFiles(newTree);
        }

    };
    const findFileById = (files: NodeModel<dataNodeModel>[], id: string | number) => {

        const itemIndex = files.findIndex((item: NodeModel<dataNodeModel>) => item.id === id);
        if (itemIndex !== -1) {
            return {file: files[itemIndex], index: itemIndex};
        }

        return {file: null, index: null}

    };
    const handleSelect = (node: NodeModel<dataNodeModel>) => setSelectedNode(node);

    // useEffect(() => {
    //   setFiles(newFiles);
    // }, []);

    // useEffect(() => {
    //   files && initFile3(files);
    //   setTimeout(() => {
    //     //console.log(vol.toJSON())
    //     //deleteFile('/01-simple-example/stdlib.fc1');
    //
    //   }, 3000);
    //
    // }, [JSON.stringify(files)]);

    // const changePathFilesChildrenFolder = (files: any, id: any) => {
    //     const childrenFiles = files.filter((file: any) => file.parent == id);
    //     for (let i = 0; i < childrenFiles.length; i++) {
    //         const fileName = childrenFiles[i].text;
    //         const path = getFilePath(files, fileName, id);
    //         const index = files.findIndex((file: any) => file.id === childrenFiles[i].id);
    //         files[index].data.path = path;
    //     }
    //     if (childrenFiles) setFiles(files);
    // };

    const onChangeFileName = async (id: string | number, fileName: string) => {
        if (!files) return;
        const {file, index} = findFileById(files, id);
        if (!file) return;
        const oldPath = getFilePath(files, file.text, file.parent)
        const isNameMatch = isNameMatchCheck(files, fileName, file.parent);
        if (isNameMatch) return;


        if (file.data) {
           // const language = getFileLanguage(fileName);
            const path = getFilePath(files, fileName, file.parent);
            file.data = {...file.data, path};
        }
        file.text = fileName;
        if (file?.data?.type === 'file') {
            const path = getFilePath(files, fileName, file.parent);
          await  moveFile(oldPath, path, file.data.value);
        } else {
          console.log("files[index]",files[index])
          await  renameDirectory(file,files, index, oldPath);
        }
        // const newFiles = changeFileName(file, index);
        // if (!file.data) {
        //     changePathFilesChildrenFolder(newFiles, id);
        // }

    };

    const onDelete =  (id: number | string) => {
        console.log("onDelete 1");
        if (!files) return;
        // const {index} = findFileById(files, id);
        // if (!index) return;
        //removeFile
        console.log("onDelete 2");
        deleteFile(id);
        const {file} = findFileById(files, id);
        const patch = getFilePath(files, file?.text??'', file?.parent??'');
        removeFile(patch);


    };

    const addFolder = async (event: React.MouseEvent) => {
        event.stopPropagation();
        const parent = 1;
        let fileName = 'untitled';
        const isNameMatch = isNameMatchCheck(files, 'untitled', parent);
        if (isNameMatch) fileName = generateUniqueName(files, fileName);
        const path = getFilePath(files, fileName, parent);
        const template = {
            'id': lastId + 1,
            parent,
            'droppable': true,
            'text': fileName,
            data: { type: 'directory' }
        };
        if (!files) return;
        await createNewFolder(path);
        const mergedTree = [...files, template];
        setFiles(mergedTree);
        setLastId(lastId + 1);
    };


    const addFile = async (event: React.MouseEvent) => {
        event.stopPropagation();
        event.stopPropagation();
        const parent = 1;
        let fileName = 'unnamed';
        const isNameMatch = isNameMatchCheck(files, fileName, parent);
        if (isNameMatch) fileName = generateUniqueName(files, fileName);
        const path = getFilePath(files, fileName, parent);
        const template = {
            'id': lastId + 1,
            parent,
            'droppable': false,
            'text': fileName,
            'data': {
                path,
                //'fileType': 'txt',
                value: "",
                type: 'file'
                //'language': 'txt'
            }
        }
        if (!files) return;
        await saveFile(path);
        const mergedTree = [...files, template];
        console.log("mergedTree", toJS(mergedTree))
        setFiles(mergedTree);
        setLastId(lastId + 1);
    };

    console.log("files", files)

    return <>
        <FileCreator addFile={addFile} addFolder={addFolder}/>
            <Tree
                tree={files ?? []}
                rootId={0}
                extraAcceptTypes={[NativeTypes.FILE]}
                render={(
                    node: NodeModel<dataNodeModel>,
                    {depth, isOpen, onToggle},
                ) => (
                    <CustomNode
                        node={node}
                        depth={depth}
                        isOpen={isOpen}
                        onToggle={onToggle}
                        onChangeFileName={onChangeFileName}
                        onDelete={onDelete}
                        onSelect={handleSelect}
                        isSelected={node.id === selectedNode?.id}
                    />
                )}
                onDrop={handleDrop}
                classes={{
                    root: 'treeRoot',
                    draggingSource: 'draggingSource',
                    dropTarget: 'dropTarget',
                }}
            />
    </>;
});