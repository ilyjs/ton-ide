import {FileStore} from "./FileStore";

export class RootStore {
    fileStore: FileStore;

    constructor() {
        this.fileStore = new FileStore(this);
    }
}
