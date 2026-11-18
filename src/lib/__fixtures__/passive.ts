/**
 * Fixtures for passive-voice regression tests (EN + ES only).
 * `passive: true`  → real passive/impersonal construction.
 * `passive: false` → looks like one but is not (false positive guard).
 */
export interface PassiveCase {
  text: string;
  passive: boolean;
  note?: string;
}

export const enPassiveCases: PassiveCase[] = [
  // Real passives
  { text: 'The report was written.', passive: true },
  { text: 'The report was written by the team.', passive: true },
  { text: 'The bug has been fixed.', passive: true },
  { text: 'The cake is being baked.', passive: true },
  { text: 'The email was not sent.', passive: true },
  { text: 'The package was quickly delivered.', passive: true },
  { text: 'The lights were turned on by Ana.', passive: true, note: 'phrasal verb WITH agent' },
  { text: 'It is often broken into parts.', passive: true },
  { text: 'He got fired.', passive: true },
  { text: 'The data is stored in the cloud.', passive: true },
  // False positives
  { text: 'She is turned on.', passive: false, note: 'phrasal verb, no agent' },
  { text: 'The lamp is turned off at night.', passive: false },
  { text: 'He is said to be a genius.', passive: false, note: 'raising construction' },
  { text: 'It is expected to rain.', passive: false },
  { text: 'She is interested in music.', passive: false, note: 'adjectival participle' },
  { text: 'The code is based on a standard.', passive: false },
  { text: 'He was tired.', passive: false },
  { text: 'I am logged in.', passive: false },
  { text: 'It is open.', passive: false, note: '-en word that is not a participle' },
  { text: 'There are seven files.', passive: false },
  { text: 'This is indeed useful.', passive: false },
  { text: 'The cat sat on the mat.', passive: false },
  { text: 'We shipped the feature yesterday.', passive: false },
];

export const esPassiveCases: PassiveCase[] = [
  // Real passives / impersonal
  { text: 'El informe fue escrito por el equipo.', passive: true },
  { text: 'El archivo fue modificado por el administrador.', passive: true },
  { text: 'Los datos son almacenados en la nube.', passive: true },
  { text: 'Se registró.', passive: true },
  { text: 'Se registró el usuario.', passive: true },
  { text: 'Se requiere una clave de API.', passive: true },
  { text: 'Se publicó el artículo anoche.', passive: true },
  // False positives
  { text: 'Se me olvidó.', passive: false, note: 'accidental se' },
  { text: 'Se me olvidó la contraseña.', passive: false },
  { text: 'Se le cayó el teléfono.', passive: false },
  { text: 'Se lo dije ayer.', passive: false },
  { text: 'Se fue temprano.', passive: false, note: 'reflexive verb' },
  { text: 'Se llama Ana.', passive: false },
  { text: 'Eso es todo.', passive: false, note: 'ser + quantifier' },
  { text: 'Esto es esto.', passive: false },
  { text: 'El equipo escribió el informe ayer.', passive: false },
  { text: 'El gato duerme en la casa.', passive: false },
];
