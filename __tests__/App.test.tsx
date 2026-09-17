/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import App from '../App';

test('renders the account dashboard screen', async () => {
  let app: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    app = ReactTestRenderer.create(<App />);
  });

  const texts = app!.root.findAllByType(Text).map((node) => node.props.children);
  expect(texts.join(' ')).toContain('Portfolio');
  expect(texts.join(' ')).toContain('CHF 124,580.00');
});
