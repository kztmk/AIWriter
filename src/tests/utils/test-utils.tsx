import type { PreloadedState } from '@reduxjs/toolkit';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { setupStore } from '../../app/store';
import type { AppStore, RootState } from '../../app/store';
// As a basic setup, import slice reducers here.

// This type intreface extends the default options for render from RTL,
// as well as allows the user to specify other things such as initial store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const Wrapper = ({ children }: PropsWithChildren<{}>) => {
    return <Provider store={store}>{children}</Provider>;
  };

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

export default renderWithProviders;
