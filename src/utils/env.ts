/**
 * Checks if the current Node environment matches the provided environment.
 *
 * `NODE_ENV` is typically used to indicate the application's operational mode:
 * - "development": Local development mode with debugging enabled.
 * - "production": Optimized mode for deployment in live environments.
 * - "test": Test mode, often used by test runners.
 *
 * In a microservice backend like an AuthService, this variable is mainly useful
 * for runtime behavior configuration—optimizing logs, error handling, or toggling debug modes.
 *
 * @param {string} env - The Node environment to check (e.g., 'development', 'production').
 * @returns {boolean} - True if the current `NODE_ENV` matches, false otherwise.
 */
export const isNodeEnv = (env: string): boolean => {
  return process.env.NODE_ENV === env;
};

/**
 * Checks if the current Application Environment (`APP_ENV`) matches the provided value.
 *
 * `APP_ENV` is a custom variable that represents specific deployment environments
 * such as "local", "staging", or "production". This allows fine-grained control
 * over the behavior of the AuthService depending on the deployment context,
 * especially when staging environments may also use a production-like `NODE_ENV`.
 *
 * For instance, `APP_ENV` could toggle logging detail levels, enable or disable
 * certain features, or adjust API endpoints for testing in staging versus production.
 *
 * @param {string} env - The Application Environment to check (e.g., 'local', 'staging', 'production').
 * @returns {boolean} - True if the current `APP_ENV` matches, false otherwise.
 */
export const isAppEnv = (env: string): boolean => {
  return process.env.APP_ENV === env;
};
