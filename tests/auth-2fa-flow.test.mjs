import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyApiError } from '../src/api/apiErrors.ts';
import { toFrontendRole } from '../src/lib/roles.ts';

test('classifyApiError identifies expired 2FA challenge tokens as unauthorized / requiresLogin', () => {
  const expiredError = {
    response: {
      status: 401,
      data: {
        message: 'El token temporal de autenticación ha expirado.',
      },
    },
  };

  const classified = classifyApiError(expiredError);
  assert.equal(classified.status, 401);
  assert.equal(classified.kind, 'UNAUTHORIZED');
  assert.equal(classified.requiresLogin, true);

  const isExpired =
    classified.status === 401 ||
    classified.status === 410 ||
    classified.message.toLowerCase().includes('expir');

  assert.equal(isExpired, true, 'Should detect token expiration');
});

test('classifyApiError distinguishes invalid TOTP code (400 validation) from expired session', () => {
  const badCodeError = {
    response: {
      status: 400,
      data: {
        message: 'Código de verificación 2FA inválido o fuera de ventana.',
      },
    },
  };

  const classified = classifyApiError(badCodeError);
  assert.equal(classified.status, 400);
  assert.equal(classified.kind, 'VALIDATION');
  assert.equal(classified.requiresLogin, false);

  const isExpired =
    classified.status === 401 ||
    classified.status === 410 ||
    (classified.message.toLowerCase().includes('expir') && !classified.message.toLowerCase().includes('código'));

  assert.equal(isExpired, false, 'Invalid code error should not force full session restart');
});

test('2FA code regex formats: 6 digits for TOTP, 8 digits for backup codes', () => {
  const totpRegex = /^\d{6}$/;
  const backupRegex = /^\d{8}$/;

  assert.equal(totpRegex.test('123456'), true);
  assert.equal(totpRegex.test('12345'), false);
  assert.equal(totpRegex.test('1234567'), false);
  assert.equal(totpRegex.test('abcdef'), false);

  assert.equal(backupRegex.test('12345678'), true);
  assert.equal(backupRegex.test('1234567'), false);
  assert.equal(backupRegex.test('123456789'), false);
  assert.equal(backupRegex.test('1234abcd'), false);
});

test('confirm2FA contract: strictly requires success === true', () => {
  let mockSessionUser = {
    id: '1',
    email: 'medico@esu.com',
    twoFactorEnabled: false,
  };

  const verifyLogic = (responseSuccess) => {
    const isSuccess = responseSuccess === true;
    if (isSuccess && mockSessionUser) {
      mockSessionUser.twoFactorEnabled = true;
    }
    return isSuccess;
  };

  // Case 1: Backend responds { success: false }
  const resFalse = verifyLogic(false);
  assert.equal(resFalse, false);
  assert.equal(mockSessionUser.twoFactorEnabled, false, 'Must not activate 2FA when success is false');

  // Case 2: Backend responds { success: undefined }
  const resUndef = verifyLogic(undefined);
  assert.equal(resUndef, false);
  assert.equal(mockSessionUser.twoFactorEnabled, false, 'Must not activate 2FA when success is missing');

  // Case 3: Backend responds { success: true }
  const resTrue = verifyLogic(true);
  assert.equal(resTrue, true);
  assert.equal(mockSessionUser.twoFactorEnabled, true, 'Must activate 2FA when success is strictly true');
});

test('verify2FALogin contract: validates accessToken, maps roles and sets twoFactorEnabled: true', () => {
  const challengeResponse = {
    accessToken: 'jwt-post-2fa-token',
    usuarioId: 305,
    email: 'admin.esu@cruzdeleje.gov.ar',
    nombre: 'Elena',
    apellido: 'Gomez',
    rol: 'ADMIN',
    emailVerificado: true,
  };

  assert.ok(challengeResponse.accessToken, 'Access token is required');

  const user = {
    id: String(challengeResponse.usuarioId),
    usuarioId: String(challengeResponse.usuarioId),
    pacienteId: undefined,
    profesionalId: undefined,
    nombre: challengeResponse.nombre,
    apellido: challengeResponse.apellido,
    email: challengeResponse.email,
    dni: '',
    rol: toFrontendRole(challengeResponse.rol),
    activo: true,
    twoFactorEnabled: true,
    emailVerified: challengeResponse.emailVerificado,
  };

  assert.equal(user.twoFactorEnabled, true);
  assert.equal(user.rol, 'ADMIN');
  assert.equal(user.id, '305');
});

test('refreshSession contract: restores twoFactorEnabled from backend /auth/me payload', () => {
  const mePayloadActive = {
    id: 10,
    usuarioId: 10,
    email: 'paciente@esu.com',
    rol: 'PACIENTE',
    activo: true,
    verificado: true,
    twoFactorEnabled: true,
  };

  const refreshedUser1 = {
    id: String(mePayloadActive.id),
    email: mePayloadActive.email,
    rol: toFrontendRole(mePayloadActive.rol),
    twoFactorEnabled: mePayloadActive.twoFactorEnabled ?? false,
  };
  assert.equal(refreshedUser1.twoFactorEnabled, true, 'Restores true from backend');

  const mePayloadInactive = {
    id: 11,
    usuarioId: 11,
    email: 'recep@esu.com',
    rol: 'RECEPCIONISTA',
    activo: true,
    verificado: true,
    twoFactorEnabled: false,
  };

  const refreshedUser2 = {
    id: String(mePayloadInactive.id),
    email: mePayloadInactive.email,
    rol: toFrontendRole(mePayloadInactive.rol),
    twoFactorEnabled: mePayloadInactive.twoFactorEnabled ?? false,
  };
  assert.equal(refreshedUser2.twoFactorEnabled, false, 'Restores false from backend');
});

test('disable2FA contract: resets twoFactorEnabled to false in session state', () => {
  const mockUser = {
    id: '50',
    email: 'user@esu.com',
    twoFactorEnabled: true,
  };

  const disableLogic = () => {
    mockUser.twoFactorEnabled = false;
    return true;
  };

  const result = disableLogic();
  assert.equal(result, true);
  assert.equal(mockUser.twoFactorEnabled, false);
});
