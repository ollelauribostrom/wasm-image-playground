import createStore from 'react-waterfall';
import ColorService from '../services/ColorService';

type AppState = {|
  count: number,
  color: string
|};

const initialState: AppState = {
  count: 0,
  color: '#fff'
};

const config = {
  initialState,
  actionsCreators: {
    click: async ({ count }: AppState): Promise<AppState> => ({
      count: count + 1,
      color: await ColorService.getRandomColor()
    })
  }
};

export const { Provider, connect, actions } = createStore(config);
