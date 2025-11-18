import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

import { setApiBaseUrl } from '@fastfoodordering/utils';

// --- CONFIGURATION ---
const MOBILE_API_URL = 'https://palatelike-daxton-unsavourily.ngrok-free.dev/api'; 

setApiBaseUrl(MOBILE_API_URL);
// ---------------------


export default function App() {
  return <AppNavigator />;
}