/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import rawConfig from '../firebase-applet-config.json';

export const validateEnvironment = () => {
  // Validate our raw firebase config json load
  if (!rawConfig) {
    throw new Error('Missing firebase-applet-config.json file.');
  }

  const requiredFields = ['projectId', 'apiKey', 'appId', 'firestoreDatabaseId'];
  for (const field of requiredFields) {
    const val = (rawConfig as any)[field];
    if (!val || val.includes('placeholder') || val === 'MY_GEMINI_API_KEY') {
      console.warn(`Environment Warning: Field "${field}" in firebase-applet-config.json is missing or a placeholder.`);
    }
  }
};

// Auto-run validation
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failure:', error);
}
