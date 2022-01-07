import {
  TokenData,
  ActorData,
} from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
import { getCanvas, getGame, TOKEN_STORY_MODULE_NAME } from './settings';
import { TokenStory } from './token-story';

/**
 * Copy Placeable HUD template
 */
export class TokenStoryHUD extends BasePlaceableHUD {
  /**
   * Default settings
   */
  actorRequirementSetting = 0; //'None'; // required actor premission to see character art
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
    super();
    this.actorRequirementSetting = <number>getGame().settings.get(TOKEN_STORY_MODULE_NAME, 'permissionOnHover');
    this.imageHoverActive = <boolean>getGame().settings.get(TOKEN_STORY_MODULE_NAME, 'userEnableModule');
    this.imageSizeSetting = <number>getGame().settings.get(TOKEN_STORY_MODULE_NAME, 'userImageSize');
    this.imagePositionSetting = <string>getGame().settings.get(TOKEN_STORY_MODULE_NAME, 'userImagePosition');
    this.imageHoverArt = <string>getGame().settings.get(TOKEN_STORY_MODULE_NAME, 'artType');
  }

  /**
   * Retrieve and override default options for BasePlaceableHUD
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'token-story-hud',
      classes: [...super.defaultOptions.classes, 'token-story-hud'], // Use default "placeable-hud"
      minimizable: false,
      resizable: true,
      template: `modules/${TOKEN_STORY_MODULE_NAME}/templates/token-story-template.hbs`, // HTML template
    });
  }

  /**
   * Get image data for html template
   */
  getData() {
    const data = super.getData();
    const tokenObject = <Token>this.object;
    let image = <string>tokenObject.actor?.img; // Character art
    const isWildcard = tokenObject.actor?.data.token.randomImg;
    if (
      image === this.DEFAULT_TOKEN ||
      this.imageHoverArt === 'token' ||
      (this.imageHoverArt === 'wildcard' && isWildcard)
    ) {
      // If no character art exists, use token art instead.
      image = <string>tokenObject.data.img;
    }
    data.id = tokenObject.id;
    data.url = image;
    const fileExt = this.fileExtention(image);
    if (this.videoFileExtentions.includes(fileExt)) data.isVideo = true; // if the file is not a image, we want to use the video html tag
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.token-story-hud-click').click((ev) => this._clickImage(ev));
    //html.find('[data-toggle="tooltip"]').tooltip();
  }

  _clickImage(ev) {
    const token = ev as Token;
    if (<number>getCanvas().tokens?.controlled.length > 0) {
      getCanvas().tokens?.controlled.splice(0, 0, token);
    } else {
      getCanvas().tokens?.controlled.push(token);
    }
  }

  /**
   * Attempts to get the file extention of the string input
   * @param {String} file file path in folder
   */
  fileExtention(file) {
    let fileExt = 'png'; // Assume art is a image by default
    const endOfFile = file.lastIndexOf('.') + 1;
    if (endOfFile !== undefined) fileExt = file.substring(endOfFile).toLowerCase();

    return fileExt;
  }

  /**
   * Set handout position, this uses the client screen position and zoom level to scale the image.
   */
  setPosition() {
    if (!this.object) return;
    this.updatePosition();
  }

  /**
   * While hovering over a token and zooming or moving screen position, we want to reposition the image and scale it.
   */
  updatePosition() {
    const center = <{ x: number; y: number; scale: number }>getCanvas().scene?._viewPosition; // Middle of the screen
    const imageWidthScaled = window.innerWidth / (this.imageSizeSetting * center.scale); // Scaled width of image to canvas
    let url = <string>(<Token>this.object).actor?.img; // character art
    const isWildcard = <boolean>(<Token>this.object).actor?.data.token.randomImg;
    if (
      url === this.DEFAULT_TOKEN ||
      this.imageHoverArt === 'token' ||
      (this.imageHoverArt === 'wildcard' && isWildcard)
    ) {
      // If no character art exists, use token art instead.
      url = <string>(<Token>this.object).data.img;
    }

    if (url in this.cacheImageNames) {
      this.applyToCanvas(url, imageWidthScaled, center);
    } else {
      // This only happens when you change a image on the getCanvas().
      this.cacheAvailableToken(url, imageWidthScaled, center);
    }
  }

  /**
   * Preload the url to find the width and height.
   * @param {String} url Url of the image/video to get dimensions from.
   * @return {Promise} Promise which returns the dimensions of the image/video in 'width' and 'height' properties.
   */
  loadSourceDimensions(url) {
    return new Promise((resolve) => {
      const fileExt = this.fileExtention(url);

      if (this.videoFileExtentions.includes(fileExt)) {
        const video = document.createElement('video'); // create the video element
        video.addEventListener('loadedmetadata', function () {
          // place a listener on it
          resolve({
            width: this.videoWidth, // send back result
            height: this.videoHeight,
          });
        });
        video.src = url; // start download meta-data
      } else {
        const img = new Image();
        img.addEventListener('load', function () {
          // listen to load event for image
          resolve({
            width: this.width, // send back result
            height: this.height,
          });
        });
        img.src = url;
      }
    });
  }

  /**
   * Add image to cache and show on canvas
   * @param {String} url Url of the image/video to get dimensions from.
   * @param {Number} imageWidthScaled width of image related to screen size (pixels)
   * @param {Number} center Middle of the screen with scaling (pixels)
   */
  cacheAvailableToken(url, imageWidthScaled, center) {
    getCanvas()
      //@ts-ignore
      .hud?.tokenStory.loadSourceDimensions(url)
      .then(({ width, height }) => {
        this.cacheImageNames[url] = {
          width: width,
          height: height,
        };
        if (imageWidthScaled && center) {
          this.applyToCanvas(url, imageWidthScaled, center);
        }
      });
  }

  /**
   * Rescale image to fit screen size, apply css
   * @param {String} url Url of the image/video to get dimensions from.
   * @param {Number} imageWidthScaled width of image related to screen size (pixels)
   * @param {Number} center Middle of the screen with scaling (pixels)
   */
  async applyToCanvas(url, imageWidthScaled, center) {
    const imageWidth = this.cacheImageNames[url].width; //width of original image
    const imageHeight = this.cacheImageNames[url].height; //height of original image
    const [xAxis, yAxis] = this.changePosition(imageWidth, imageHeight, imageWidthScaled, center); // move image to correct verticle position.
    const position = {
      // CSS
      width: imageWidthScaled,
      left: xAxis,
      top: yAxis,
    };
    this.element.css(position); // Apply CSS to element

    // ADD 4535992

    // await (<Token>this.object).document.update({
    //   x: xAxis,
    //   y: yAxis,
    // });

    // await (<Token>this.object).update(
    //   {
    //     x: xAxis,
    //     y: yAxis
    //   },
    //   undefined,
    // );
  }

  /**
   * Rescale original image and move to correct location within the getCanvas().
   * imagePositionSetting options include Bottom right/left and Top right/left
   * @param {Number} imageWidth width of original image (pixles)
   * @param {Number} imageHeight height of original image (pixels)
   * @param {Number} imageWidthScaled width of image related to screen size (pixels)
   * @param {Number} center Middle of the screen with scaling (pixels)
   */
  changePosition(imageWidth, imageHeight, imageWidthScaled, center) {
    const imageWidthRatio = imageWidth / imageWidthScaled;
    const imageHeightScaled = imageHeight / imageWidthRatio;
    const windowWidthScaled = window.innerWidth / center.scale;
    const windowHeightScaled = window.innerHeight / center.scale;
    let xAxis = 0;
    let yAxis = 0;

    if (this.imagePositionSetting.includes('Bottom')) {
      // move image to bottom of canvas
      yAxis = center.y + windowHeightScaled / 2 - imageHeightScaled;
    } else {
      yAxis = center.y - windowHeightScaled / 2;
    }

    if (this.imagePositionSetting.includes('right')) {
      // move image to right of canvas
      const sidebar = <HTMLElement>document.getElementById('sidebar');
      const sidebarCollapsed = sidebar.classList.contains('collapsed');
      if (this.imagePositionSetting.includes('Bottom') && sidebarCollapsed) {
        xAxis = center.x + windowWidthScaled / 2 - imageWidthScaled; // take into account if sidebar is collapsed
      } else {
        const sidebarWidthScaled = sidebar.offsetWidth / center.scale;
        xAxis = center.x + windowWidthScaled / 2 - imageWidthScaled - sidebarWidthScaled;
      }
    } else {
      xAxis = center.x - windowWidthScaled / 2;
    }
    return [xAxis, yAxis];
  }

  /**
   * check requirements then show character art
   * @param {*} token token passed in
   * @param {Boolean} hovered if token is mouseovered
   */
  showArtworkRequirements(token: Token, hovered) {
    /**
     * check token is actor, module is enabled, user has permissions to see character art
     */
    if (
      !token ||
      !token.actor ||
      this.imageHoverActive === false ||
      (token.actor.permission < this.actorRequirementSetting &&
        //@ts-ignore
        token.actor.data.permission['default'] !== -1)
    ) {
      return;
    }

    if (hovered && getCanvas().activeLayer?.name == 'TokenLayer') {
      // Show token image if hovered, otherwise don't
      this.bind(token);
    } else {
      this.clear();
    }
  }

  /**
   * actor: Actor, di solito quello collegato al player `game.user.character`
   * data : {x, y} , le coordinate dove costruire il token
   * type : string , di solito `character` ,lista dei tipi accettati da Dnd5e [actorless,character,npc,vehicle]
   */
  async createActorWithType(actor: Actor, data: { x; y }, type: string):Promise<Token|undefined> {
    let createdType = type;
    if (type === 'actorless') {
      createdType = Object.keys(CONFIG.Actor.sheetClasses)[0];
    }

    // let actorName = data.name;
    // if (actorName.includes('.')) {
    //   actorName = actorName.split('.')[0];
    // }

    //const actor = await Actor.create(
    //{
    //   name: actorName,
    //    type: createdType,
    //    img: data.img
    //});
    const actorData = <any>foundry.utils.duplicate(actor.data);

    // Prepare Token data specific to this placement
    const td = actor.data.token;
    const hg = <number>getCanvas().dimensions?.size / 2;
    data.x -= td.width * hg;
    data.y -= td.height * hg;

    // Snap the dropped position and validate that it is in-bounds
    // NOTE THE HIDDEN
    const tokenData = { x: data.x, y: data.y, hidden: true, img: actor.data.img };
    // Snap to grid
    foundry.utils.mergeObject(tokenData, getCanvas().grid?.getSnappedPosition(data.x, data.y, 1));
    if (!getCanvas().grid?.hitArea.contains(tokenData.x, tokenData.y)) {
      return undefined;
    }
    // Get the Token image
    // if ( actorData.token.randomImg ) {
    //     let images = await actor.getTokenImages();
    //     images = images.filter(i => (images.length === 1) || !(i === this._lastWildcard));
    //     const image = images[Math.floor(Math.random() * images.length)];
    //     tokenData.img = this._lastWildcard = image;
    // }

    // Merge Token data with the default for the Actor
    const tokenData2 = <TokenData>foundry.utils.mergeObject(actorData.token, tokenData, { inplace: true });
    tokenData2.actorId = actor.data._id;
    tokenData2.actorLink = true;

    // Submit the Token creation request and activate the Tokens layer (if not already active)
    getCanvas().getLayerByEmbeddedName('Token')?.activate();
    //@ts-ignore
    await getCanvas().scene?.createEmbeddedDocuments('Token', [tokenData2], {});

    // delete actor if it's actorless
    if (type === 'actorless') {
      actor.delete();
    }

    const token = <Token>getCanvas().tokens?.placeables.find((token) => {
      return token.document.actor?.id === actor.id;
    });
    
    return token;
  }
}
