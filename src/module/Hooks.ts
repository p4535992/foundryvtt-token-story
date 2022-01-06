import { warn, error, debug, i18n } from '../foundryvtt-token-story';
import { getCanvas, getGame } from './settings';
import { TokenStoryHUD } from './token-story-hud';

export const readyHooks = async () => {
  /**
   * Add Image Hover display to html on load.
   * Note: Fix hack - reconfigure and create a new sibling to the current hud element.
   */
  Hooks.on('renderHeadsUpDisplay', (app, html, data) => {
    html[0].style.zIndex = 70; // Sets image to show above other UI. This is definately a hack!
    html.append(`<template id="token-story-hud"></template>`);
    //@ts-ignore
    getCanvas().hud.tokenStory = new TokenStoryHUD();
    
    /**
     * renderHeadsUpDisplay is called when changing scene, use this to cache token images on the scene.
     */
    //@ts-ignore
    getCanvas().hud.tokenStory.cacheAvailableToken(getCanvas().hud?.tokenStory.DEFAULT_TOKEN, false, false);
    for (const token of <Token[]>getCanvas().tokens?.placeables) {
      if (!token || !token.actor) return;
      //@ts-ignore
      if (!(token.actor.img in getCanvas().hud.tokenStory.cacheImageNames)) {
        //@ts-ignore
        getCanvas().hud.tokenStory.cacheAvailableToken(token.actor.img, false, false);
      }
      //@ts-ignore
      else if (token.actor.img === getCanvas().hud.tokenStory.DEFAULT_TOKEN) {
        //@ts-ignore
        getCanvas().hud.tokenStory.cacheAvailableToken(token.data.img, false, false);
      }
    }

    const actor = <Actor>getGame().user?.character;
    const token = <Token>getCanvas().tokens?.placeables.find((token) => {
      return token.document.actor?.id === actor.id;
    });
    // const tokenPLaceable = <Token>actor?.token?.object;
    //@ts-ignore
    getCanvas().hud.tokenStory.showArtworkRequirements(token, true);
  });

  /**
   * Cache token image upon creating a actor.
   */
  Hooks.on('createToken', (scene, data) => {
    const tokenId = getGame().actors?.get(data.actorId);
    if (!tokenId) {
      return;
    }
    let imageToCache = tokenId.img;
    //@ts-ignore
    if (imageToCache === getCanvas().hud.tokenStory.DEFAULT_TOKEN) {
      imageToCache = data.img;
    }
    //@ts-ignore
    if (imageToCache && !(imageToCache in getCanvas().hud.tokenStory.cacheImageNames)) {
      //@ts-ignore
      getCanvas().hud.tokenStory.cacheAvailableToken(imageToCache, false, false);
    }
  });

  // /**
  //  * Display image when user hovers mouse over a actor
  //  * Must be used on the token layer and have relevant actor permissions (configurable settings by the game master)
  //  * @param {*} token passed in token
  //  * @param {Boolean} hovered if token is mouseovered
  //  */
  // Hooks.on('hoverToken', (token, hovered) => {

  //   // ONLY FOR FOUNDRY 9
  //   //@ts-ignore
  //   if(getGame()?.keybindings){
  //     //@ts-ignore
  //     if (!hovered || (getGame()?.keyboard?.isModifierActive(KeyboardManager.MODIFIER_KEYS.ALT))) {	// alt key in Foundry auto hovers all tokens in Foundry
  //       //@ts-ignore
  //       getCanvas().hud.tokenStory.clear();
  //       return;
  //     }
  //     //@ts-ignore
  //     if (!getGame()?.keybindings?.bindings?.get("token-story.userKeybindButton")[0]?.key) {
  //       //@ts-ignore
  //       getCanvas().hud.tokenStory.showArtworkRequirements(token, hovered)
  //     }
  //   }
  //   // FOUNDRY 0.8.9
  //   else{
  //     //@ts-ignore
  //     if (!hovered || (event && event.altKey)) {	// alt key in Foundry auto hovers all tokens in Foundry
  //       //@ts-ignore
  //       getCanvas().hud.tokenStory.clear();
  //       return;
  //     }
  //     if(hovered){
  //       //@ts-ignore
  //       getCanvas().hud.tokenStory.showArtworkRequirements(token, hovered);
  //     }
  //     // if (getCanvas().hud.tokenStory.keybindActive === false) {
  //     //     getCanvas().hud.tokenStory.showArtworkRequirements(token, hovered)
  //     // }
  //   }
  // });

  /**
   * Remove character art when deleting/dragging token (Hover hook doesn't trigger while token movement animation is on).
   */
  Hooks.on('preUpdateToken', (...args) => {
    //@ts-ignore
    getCanvas().hud.tokenStory.clear();
  });
  Hooks.on('deleteToken', (...args) => {
    //@ts-ignore
    getCanvas().hud.tokenStory.clear();
  });

  /**
   * Occasions to remove character art from screen due to weird hover hook interaction.
   */
  Hooks.on('closeActorSheet', (...args) => {
    //@ts-ignore
    getCanvas().hud.tokenStory.clear();
  });
  Hooks.on('closeSettingsConfig', (...args) => {
    //@ts-ignore
    getCanvas().hud.tokenStory.clear();
  });
  Hooks.on('closeApplication', (...args) => {
    //@ts-ignore
    getCanvas().hud.tokenStory.clear();
  });

  /**
   * When user scrolls/moves the screen position, we want to relocate the image.
   */
  Hooks.on('canvasPan', (...args) => {
    //@ts-ignore
    if (typeof getCanvas().hud.tokenStory !== 'undefined') {
      //@ts-ignore
      if (typeof getCanvas().hud.tokenStory.object === 'undefined' || getCanvas().hud.tokenStory.object === null) {
        return;
      }
      //@ts-ignore
      getCanvas().hud.tokenStory.updatePosition();
    }
  });
};

export const setupHooks = async () => {
  // setup all the hooks
};

export const initHooks = () => {
  warn('Init Hooks processing');
};