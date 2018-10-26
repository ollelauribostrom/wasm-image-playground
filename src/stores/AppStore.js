import createStore from 'react-waterfall';
import ImageService from '../services/ImageService';
import type { Language, Filter } from '../services/types';

type AppState = {
  image?: Image,
  history: Array<Image>,
  status?: string,
  language: Language,
  isDragging: boolean,
  isLoading: boolean,
  showBenchmarkModal: boolean
};

export const initialState: AppState = {
  image: null,
  history: [],
  status: null,
  language: 'js',
  isDragging: false,
  isLoading: false,
  showBenchmarkModal: false
};

export const config = {
  initialState,
  actionsCreators: {
    setStatus: (state: AppState, actions: any, status: boolean): AppState => {
      return { status };
    },
    setLanguage: (state: AppState, actions: any, language: Language): AppState => {
      return { language };
    },
    setLoading: (state: AppState, actions: any, isLoading: boolean): AppState => {
      return { isLoading };
    },
    setDragging: (state: AppState, actions: any, isDragging: boolean): AppState => {
      return { isDragging };
    },
    toggleBenchmarkModal: ({ showBenchmarkModal }: AppState): AppState => {
      return { showBenchmarkModal: !showBenchmarkModal };
    },
    upload: async (state: AppState, actions: any, files: FileList): AppState => {
      const image = await ImageService.upload(files);
      return { image, isLoading: false };
    },
    applyFilter: async ({ image, history }: AppState, actions: any, filter: Filter): AppState => {
      const newImage = await ImageService.applyFilter(image, filter);
      const newHistory = [...history];
      newHistory.push(image);
      return { image: newImage, history: newHistory, isLoading: false };
    },
    runBenchmark: async (): AppState => {
      const benchmarkResults = await ImageService.benchmark();
      return { benchmarkResults, isLoading: false, showBenchmarkModal: true };
    },
    undo: ({ history }: AppState): AppState => {
      const newHistory = [...history];
      const newImage = newHistory.pop();
      return { image: newImage, history: newHistory, isLoading: false };
    },
    download: ({ image }: AppState): AppState => {
      ImageService.download(image);
      return { isLoading: false };
    },
    delete: (): AppState => {
      return { image: null, history: [] };
    }
  }
};

export const { Provider, connect, actions } = createStore(config);
