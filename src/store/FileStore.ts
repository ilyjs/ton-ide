import {observable, action, makeObservable, computed, toJS} from 'mobx';
import {RootStore as RootStoreModel} from './rootStore';
import {NodeModel} from '@minoru/react-dnd-treeview';

export type dataNodeModel = {
    value?: string,
    path?: string
    type: string,
    hash?: number
}

export class FileStore {
    currentFile: NodeModel<dataNodeModel> | null = null;
    rootDirectory = '';
    files?: NodeModel<dataNodeModel>[] | null = null;
    selectedNode?: NodeModel<dataNodeModel> | null = null;
    lastId = 100;
    selectHashFile: number | null | undefined = null;
    setFiles = (files: NodeModel<dataNodeModel>[]) => this.files = files;
    setSelectedNode = (node: NodeModel<dataNodeModel> | null) => {
        this.selectedNode = node;
        if (node && !this.selectedNode?.droppable)  this.selectHashFile = node?.data?.hash;
        if(!node) this.selectHashFile = null;
    }
    setLastId = (lastId: number) => this.lastId = lastId;
    store: RootStoreModel;

    get selectFile() {
        if(!this.selectedNode && !this.currentFile && this.selectHashFile && this.files) {
            return  this.files.find((file) => file?.data?.hash === this.selectHashFile);
        }
        if (!this.selectedNode) return toJS(this.currentFile);
        if (!this.selectedNode.droppable) {
            this.currentFile = this.selectedNode;
            return toJS(this.selectedNode);
        }
        return toJS(this.currentFile);
    }

    changeFile = (file: NodeModel<dataNodeModel>, index: number) => {
        if(this.files) {
            this.files[index] = file
        }
    }

    changeFileName = (file: NodeModel<dataNodeModel>, index: number) => {
        if (this.files && this.files[index]) {
            this.files[index] = file;
            return toJS(this.files);
        }
        return null;
    }

    deleteFile = (id: number | string) => {
        if (this.files) {
            const files = this.files.filter((file,) => file.id !== id);
            this.files = files;
           // this.files.splice(index, 1);
        }
    }

    setRootDirectory = (nameDirectory: string) => {
        this.rootDirectory = nameDirectory;
    }

    constructor(protected rootStore: RootStoreModel) {
        this.store = rootStore;
        makeObservable(this, {
            files: observable,
            rootDirectory: observable,
            selectedNode: observable,
            lastId: observable,
            setSelectedNode: action,
            setFiles: action,
            changeFile: action,
            setLastId: action,
            changeFileName: action,
            deleteFile: action,
            setRootDirectory: action,
            selectFile: computed

        });

    }


}
