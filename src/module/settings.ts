export const TOKEN_STORY_MODULE_NAME = 'token-story';

/**
 * Because typescript doesn't know when in the lifecycle of foundry your code runs, we have to assume that the
 * canvas is potentially not yet initialized, so it's typed as declare let canvas: Canvas | {ready: false}.
 * That's why you get errors when you try to access properties on canvas other than ready.
 * In order to get around that, you need to type guard canvas.
 * Also be aware that this will become even more important in 0.8.x because no canvas mode is being introduced there.
 * So you will need to deal with the fact that there might not be an initialized canvas at any point in time.
 * @returns
 */
 export function getCanvas(): Canvas {
  if (!(canvas instanceof Canvas) || !canvas.ready) {
    throw new Error('Canvas Is Not Initialized');
  }
  return canvas;
}

/**
 * Because typescript doesn't know when in the lifecycle of foundry your code runs, we have to assume that the
 * canvas is potentially not yet initialized, so it's typed as declare let canvas: Canvas | {ready: false}.
 * That's why you get errors when you try to access properties on canvas other than ready.
 * In order to get around that, you need to type guard canvas.
 * Also be aware that this will become even more important in 0.8.x because no canvas mode is being introduced there.
 * So you will need to deal with the fact that there might not be an initialized canvas at any point in time.
 * @returns
 */
export function getGame(): Game {
  if (!(game instanceof Game)) {
    throw new Error('Game Is Not Initialized');
  }
  return game;
}

export const registerSettings = function () {
  // Game master setting
  getGame().settings.register(TOKEN_STORY_MODULE_NAME, 'permissionOnHover', {
    name: 'Required actor permission', // Setting name
    hint: 'Required permission level of Actor to see handout.', // Setting description
    scope: 'world', // Global setting
    config: true, // Show setting in configuration view
    //restricted: true,       // Game master only
    choices: {
      // Choices
      0: 'None',
      1: 'Limited',
      2: 'Observer',
      3: 'Owner',
    },
    default: 0, // Default value
    type: Number, // Value type
  });

  // Game master setting
  getGame().settings.register(TOKEN_STORY_MODULE_NAME, 'artType', {
    name: 'Art on hover', // Setting name
    hint: 'The type of art shown on hover', // Setting description
    scope: 'world', // Global setting
    config: true, // Show setting in configuration view
    //restricted: true,       // Game master only
    choices: {
      // Choices
      character: 'Character art',
      token: 'Token art',
      wildcard: 'Token art if wildcard',
    },
    default: 'character', // Default value
    type: String, // Value type
  });

  // client setting
  getGame().settings.register(TOKEN_STORY_MODULE_NAME, 'userEnableModule', {
    name: 'Enable/Disable Image Hover', // Setting name
    hint: 'Uncheck to disable Image Hover (per user).', // Setting description
    scope: 'client', // client-stored setting
    config: true, // Show setting in configuration view
    type: Boolean, // Value type
    default: true, // The default value for the setting
    onChange: (value) => {
      //@ts-ignore
      getCanvas().hud?.tokenStory.clear();
    },
  });

  // ONLY FOR FOUNDRY 9
  /*
  getGame().keybindings.register(TOKEN_STORY_MODULE_NAME, "userKeybindButton", {
    name: "Keybind",                                    // Setting name
    hint: "Assign the additional keybind requirement to show a image while hovering a token (per user).",     // Setting description
    editable: [],
    onDown: () => {
      const hoveredToken = getCanvas().tokens?.placeables.some((t:Token) => {
        return t.is
      });
      if (hoveredToken !== null) {
        getCanvas().hud.tokenStory.showArtworkRequirements(hoveredToken, true);
      }
    },
    restricted: false,
    reservedModifiers: [],
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
  });
  */

  // client setting
  getGame().settings.register(TOKEN_STORY_MODULE_NAME, 'userImagePosition', {
    name: 'Position of image', // Setting name
    hint: 'Set the location of the image on the screen (per user).', // Setting description
    scope: 'client', // Client-stored setting
    config: true, // Show setting in configuration view
    choices: {
      // Choices
      'Bottom left': 'Bottom left',
      'Bottom right': 'Bottom right',
      'Top left': 'Top left',
      'Top right': 'Top right',
    },
    default: 'Bottom left', // Default Value
    type: String, // Value type
  });

  // client setting
  getGame().settings.register(TOKEN_STORY_MODULE_NAME, 'userImageSize', {
    name: 'Image to monitor width', // Setting name
    hint: 'Changes the size of the image (per user), smaller value implies larger image (1/value of your screen width).', // Setting description
    scope: 'client', // Client-stored setting
    config: true, // Show setting in configuration view
    //@ts-ignore
    range: {
      // Choices
      min: 3,
      max: 20,
      step: 0.5,
    },
    default: 7, // Default Value
    type: Number, // Value type
  });
};
