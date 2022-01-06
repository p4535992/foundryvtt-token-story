import { getGame, TOKEN_STORY_MODULE_NAME } from './settings';

export class TokenStory {
  /**
   * Default settings
   */
  actorRequirementSetting = 'None'; // required actor premission to see character art
  imageHoverActive = true; // Enable/Disable module
  imagePositionSetting = 'Bottom left'; // location of character art
  imageSizeSetting = 7; // size of character art
  imageHoverArt = 'character'; // Art type on hover (Character art or Token art)
  DEFAULT_TOKEN = 'icons/svg/mystery-man.svg'; // default token for foundry vtt

  /**
   * Supported Foundry VTT file types
   */
  imageFileExtentions = ['jpg', 'jpeg', 'png', 'svg', 'webp']; // image file extentions
  videoFileExtentions = ['mp4', 'ogg', 'webm', 'm4v']; // video file extentions

  cacheImageNames = {}; // url file names cache

  /**
   * Assign module settings
   */
  constructor() {
    this.actorRequirementSetting = <string>getGame().settings.get(TOKEN_STORY_MODULE_NAME, 'permissionOnHover');
    this.imageHoverActive = <boolean>getGame().settings.get(TOKEN_STORY_MODULE_NAME, 'userEnableModule');
    this.imageSizeSetting = <number>getGame().settings.get(TOKEN_STORY_MODULE_NAME, 'userImageSize');
    this.imagePositionSetting = <string>getGame().settings.get(TOKEN_STORY_MODULE_NAME, 'userImagePosition');
    this.imageHoverArt = <string>getGame().settings.get(TOKEN_STORY_MODULE_NAME, 'artType');
  }
}
