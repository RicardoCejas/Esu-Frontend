import test from 'node:test'
import assert from 'node:assert/strict'
import { API_ENDPOINTS } from '../src/api/endpoints.ts'
import {
  attachGsiScript,
  GOOGLE_GSI_SCRIPT_ID,
  GOOGLE_GSI_SCRIPT_SRC,
  initializeGoogleSignInOnce,
  isGoogleAuthEnabled,
  resetGsiStateForTests,
  setActiveGoogleCredentialHandler,
} from '../src/features/auth/googleGsi.ts'

test('auth endpoints configuration includes google and refresh', () => {
  assert.equal(API_ENDPOINTS.auth.google, '/auth/google')
  assert.equal(API_ENDPOINTS.auth.refresh, '/auth/refresh')
  assert.equal(API_ENDPOINTS.auth.twoFactorSetup, '/auth/2fa/setup')
  assert.equal(API_ENDPOINTS.auth.twoFactorVerify, '/auth/2fa/verify')
  assert.equal(API_ENDPOINTS.auth.twoFactorChallenge, '/auth/2fa/challenge')
  assert.equal(API_ENDPOINTS.auth.twoFactorDisable, '/auth/2fa/disable')
  assert.equal(API_ENDPOINTS.turnos.reservarPublico, '/turnos/publico/reservar')
})

test('google idToken payload validation rejects empty credentials', () => {
  const validateGoogleIdToken = (token) => {
    if (!token || typeof token !== 'string' || !token.trim()) {
      throw new Error('El token de autenticación de Google es obligatorio.')
    }
    return token.trim()
  }

  assert.throws(() => validateGoogleIdToken(''), /obligatorio/)
  assert.throws(() => validateGoogleIdToken('   '), /obligatorio/)
  assert.throws(() => validateGoogleIdToken(null), /obligatorio/)
  assert.equal(validateGoogleIdToken('valid.jwt.token'), 'valid.jwt.token')
})

test('isGoogleAuthEnabled honors explicit env flags and trims clientId', () => {
  assert.equal(isGoogleAuthEnabled({ VITE_GOOGLE_AUTH_ENABLED: 'true' }), true)
  assert.equal(
    isGoogleAuthEnabled({ VITE_GOOGLE_AUTH_ENABLED: 'false', VITE_GOOGLE_CLIENT_ID: 'abc.apps.googleusercontent.com' }),
    false
  )
  assert.equal(isGoogleAuthEnabled({ VITE_GOOGLE_CLIENT_ID: '   ' }), false)
  assert.equal(isGoogleAuthEnabled({ VITE_GOOGLE_CLIENT_ID: 'abc.apps.googleusercontent.com' }), true)
})

test('initializeGoogleSignInOnce runs only once per client and delegates to latest active handler', () => {
  resetGsiStateForTests()
  const initializeCalls = []
  const fakeGsiApi = {
    initialize(config) {
      initializeCalls.push(config)
    },
    prompt() {},
    renderButton() {},
  }

  const received = []
  const releaseFirst = setActiveGoogleCredentialHandler((res) => {
    received.push(`first:${res.credential}`)
  })

  assert.equal(initializeGoogleSignInOnce(fakeGsiApi, 'client-1'), true)
  assert.equal(initializeGoogleSignInOnce(fakeGsiApi, 'client-1'), false)
  assert.equal(initializeCalls.length, 1)

  // Simula remount / cambio de ruta /login -> /registro reutilizando la misma inicializacion GSI
  const releaseSecond = setActiveGoogleCredentialHandler((res) => {
    received.push(`second:${res.credential}`)
  })
  releaseFirst() // El cleanup antiguo NO debe borrar el handler de la nueva instancia

  assert.equal(initializeGoogleSignInOnce(fakeGsiApi, 'client-1'), false)
  assert.equal(initializeCalls.length, 1)

  initializeCalls[0].callback({ credential: 'tok-123' })
  assert.deepEqual(received, ['second:tok-123'])

  // Cambiar clientId o reemplazar instancia GSI vuelve a inicializar limpiamente
  assert.equal(initializeGoogleSignInOnce(fakeGsiApi, 'client-2'), true)
  assert.equal(initializeCalls.length, 2)

  releaseSecond()
  resetGsiStateForTests()
})

test('attachGsiScript deduplicates listeners across StrictMode cleanup and supports retry after error', () => {
  const byId = new Map()
  let createdCount = 0

  const createScriptNode = () => {
    createdCount += 1
    const listeners = { load: new Set(), error: new Set() }
    const node = {
      id: '',
      src: '',
      async: false,
      defer: false,
      dataset: {},
      listeners,
      addEventListener(type, fn) {
        listeners[type]?.add(fn)
      },
      removeEventListener(type, fn) {
        listeners[type]?.delete(fn)
      },
      remove() {
        if (node.id) byId.delete(node.id)
      },
      dispatch(type) {
        for (const fn of [...(listeners[type] || [])]) {
          fn()
        }
      },
    }
    return node
  }

  const fakeHost = {
    getScriptById(id) {
      return byId.get(id) ?? null
    },
    createScript() {
      return createScriptNode()
    },
    appendScript(node) {
      if (node.id) byId.set(node.id, node)
      return node
    },
  }

  let mount1Loads = 0
  let mount2Loads = 0
  let errors = 0

  // Mount 1 (StrictMode primer ciclo) -> se desmonta antes que termine de cargar el script
  const detach1 = attachGsiScript(fakeHost, () => { mount1Loads += 1 }, () => { errors += 1 })
  detach1()

  // Mount 2 (StrictMode segundo ciclo) reutiliza el mismo <script>
  const detach2 = attachGsiScript(fakeHost, () => { mount2Loads += 1 }, () => { errors += 1 })
  const script1 = fakeHost.getScriptById(GOOGLE_GSI_SCRIPT_ID)
  assert.ok(script1)
  assert.equal(createdCount, 1)
  assert.equal(script1.src, GOOGLE_GSI_SCRIPT_SRC)
  assert.equal(script1.listeners.load.size, 1)

  script1.dispatch('load')
  assert.equal(mount1Loads, 0)
  assert.equal(mount2Loads, 1)
  assert.equal(errors, 0)
  detach2()

  // Si falla por bloqueador o red, al reintentar reemplaza el script fallido cleanly
  script1.dataset.gsiState = 'error'
  let retryLoads = 0
  let retryErrors = 0
  const detachRetry = attachGsiScript(fakeHost, () => { retryLoads += 1 }, () => { retryErrors += 1 })
  const script2 = fakeHost.getScriptById(GOOGLE_GSI_SCRIPT_ID)
  assert.equal(createdCount, 2)
  assert.notEqual(script2, script1)

  script2.dispatch('error')
  assert.equal(retryErrors, 1)
  assert.equal(script2.dataset.gsiState, 'error')
  assert.equal(retryLoads, 0)
  detachRetry()
})
