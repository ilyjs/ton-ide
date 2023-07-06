import {createContext, useContext} from 'react';
import {RootStore} from './rootStore';

export const store = new RootStore();

export const StoreContext = createContext(store);
export const useStore = () => {
    return useContext(StoreContext);
};
