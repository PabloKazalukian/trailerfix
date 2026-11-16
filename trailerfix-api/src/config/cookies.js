import environment from './environment.js';

function resolveSecure(secureConfig, nodeEnv) {
  if (secureConfig === true) return true;
  if (secureConfig === false) return false;
  return nodeEnv === 'production';
}

function resolveSameSite(sameSiteConfig) {
  const normalized = String(sameSiteConfig).toLowerCase();
  if (['lax', 'strict', 'none'].includes(normalized)) return normalized;
  return 'lax';
}

export const cookieConfig = {
  get name() {
    return environment.cookie.name;
  },

  get options() {
    const secure = resolveSecure(environment.cookie.secure, environment.nodeEnv);
    const sameSite = resolveSameSite(environment.cookie.sameSite);
    const domain = environment.cookie.domain;
    const maxAge = environment.cookie.maxAge;

    const base = {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
      maxAge,
    };

    if (domain) {
      base.domain = domain;
    }

    if (sameSite === 'none' && !secure) {
      console.warn('[cookieConfig] SameSite=None requiere Secure=true; forzando secure=true');
      base.secure = true;
    }

    if (environment.nodeEnv === 'production' && !secure) {
      console.warn('[cookieConfig] Producción debería usar Secure=true');
    }

    return base;
  },

  get clearOptions() {
    const opts = { ...this.options };
    opts.maxAge = 0;
    opts.expires = new Date(0);
    return opts;
  },
};

export default cookieConfig;