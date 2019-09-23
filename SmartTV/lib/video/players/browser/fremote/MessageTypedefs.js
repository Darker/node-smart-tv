/**
 * @typedef {Object} RDMessageRequest - remote debugger message
 * @property {string} to target actor on server
 * @property {string} type type of message
 */

/**
 * @typedef {Object} RDMessageResponse - remote debugger message
 * @property {string} from source actor on server
 */

/**
 * @typedef {Object} TabInfo 
 * @property {string} actor target adctor
 * @property {string} title tab title
 * @property {string} url tab URL
 * @property {{ isBrowsingContext: true }} traits
 * @property {number} outerWindowID
 * @property {string} consoleActor
 * @property {string} inspectorActor
 * @property {string} styleSheetsActor
 * @property {string} storageActor
 * @property {string} memoryActor
 * @property {string} framerateActor 
 * @property {string} reflowActor
 * @property {string} cssPropertiesActor
 * @property {string} performanceActor
 * @property {string} animationsActor
 * @property {string} promisesActor
 * @property {string} emulationActor
 * @property {string} webExtensionInspectedWindowActor
 * @property {string} accessibilityActor
 * @property {string} screenshotActor
 * @property {string} changesActor
 * @property {string} webSocketActor
 * @property {string} manifestActor
 */

/**
 * @typedef {Object} RDMessageResponseTabs
 * @property {string} from source actor on server
 * @property {TabInfo[]} tabs list of tabs
 * @property {number} selected numeric index of selected tab
 */

/**
 * @typedef {Object} RDEvalJSRequest
 * @property {string} text the JS code to evaluate
 * @property {?} frameActor ?
 * @property {?} selectedNodeActor ?
 * @property {?} selectedObjectActor ?
 * @property {string} url ?
 * 
 */
/**
 * @typedef {{  "type": "tabAttached",  "threadActor": "server1.conn0.child1/thread20",  "cacheDisabled": false, "javascriptEnabled": true, "traits": { "reconfigure": false,"frames": true, "logInPage": true, "canRewind": false },"from": "server1.conn0.child1/frameTarget1"}} RDAttachResponse
 * 
*/

/**
 * 
 * This is what rthe response to eval JS looks like:
 * 
    return {
      input: input,
      result: resultGrip,
      awaitResult,
      timestamp: timestamp,
      exception: errorGrip,
      exceptionMessage: this._createStringGrip(errorMessage),
      exceptionDocURL: errorDocURL,
      exceptionStack,
      errorMessageName,
      frame,
      helperResult: helperResult,
      notes: errorNotes,
    };
    **/

/**
 * ATTACH response
{
  "type": "tabAttached",
  "threadActor": "server1.conn0.child1/thread20",
  "cacheDisabled": false,
  "javascriptEnabled": true,
  "traits": {
    "reconfigure": false,
    "frames": true,
    "logInPage": true,
    "canRewind": false
  },
  "from": "server1.conn0.child1/frameTarget1"
}
**/