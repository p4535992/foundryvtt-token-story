import { TOKEN_STORY_MODULE_NAME } from './settings';

export const preloadTemplates = async function () {
  const templatePaths = [
    // Add paths to "modules/foundryvtt-riddle-one/templates"
    `modules/${TOKEN_STORY_MODULE_NAME}/templates/token-story-template.hbs`,
  ];
  return loadTemplates(templatePaths);
};
