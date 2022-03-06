/* eslint-disable unicorn/consistent-function-scoping */
import create, { SetState } from 'zustand';
import { devtools } from 'zustand/middleware';

export type UiStoreState = {
	stuff: string;
	setStuff: (stuff: string) => void;
};

const store = (set: SetState<UiStoreState>) =>
	({
		stuff: 'Learn React',
		setStuff: (stuff) => set({ stuff }),
	} as UiStoreState);

export const useUiStore =
	process.env.NODE_ENV === 'production'
		? create(store)
		: create(devtools(store, 'AgentApp-UIStore'));
