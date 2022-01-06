import { getGame } from './settings';

export default [
  {
    name: 'FRIENDLY',
    shouldShowTooltip: (token) => {
      return token.data.disposition >= CONST.TOKEN_DISPOSITIONS.FRIENDLY;
    },
  },
  {
    name: 'NEUTRAL',
    shouldShowTooltip: (token) => {
      return token.data.disposition >= CONST.TOKEN_DISPOSITIONS.NEUTRAL;
    },
  },
  {
    name: 'ALL_PLAYERS',
    shouldShowTooltip: (token) => {
      return token.actor.hasPlayerOwner;
    },
  },
  {
    name: 'OWNER',
    shouldShowTooltip: (token) => {
      return token.owner;
    },
  },
  {
    name: 'OBSERVER',
    shouldShowTooltip: (token) => {
      return token.observer;
    },
  },
  {
    name: 'LIMITED',
    shouldShowTooltip: (token) => {
      return token.actor?.testUserPermission(getGame().user, CONST.ENTITY_PERMISSIONS.LIMITED);
    },
  },
  {
    name: 'ALL',
    shouldShowTooltip: (token) => {
      return true;
    },
  },
];
