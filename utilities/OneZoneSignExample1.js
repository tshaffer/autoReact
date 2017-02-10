/**
 * Created by jsugg on 2/9/17.
 */

const redux = require('redux');
const rt = require('redux-thunk');
const thunk = rt.default;

const util = require('util');
const {inspect} = util;
const fs = require('fs');

const DM_DEV = true;
let dm;
if (DM_DEV) {
    dm = require('../temp/libbsdm/main');
} else {
    dm = require('@brightsign/bsdatamodel')
}

const {
    bsDmReducer,
    // Enums
    VideoMode, PlayerModel, ZoneType, MediaType, DataFeedUsageType,
    // Actions
    dmNewSign, dmOpenSign, dmCheckForInvalidDmState, dmAddZone, dmPlaylistAppendMediaState, dmPlaylistMoveMediaStateRange,
    // Selectors
    dmGetZoneByName, dmGetZoneTagMap,
    // Helpers
    dmGetZoneMediaStateContainer, dmCreatePercentageRect,
    dmCreateMediaContentItem
} = dm;

function createOneZoneSign()
{
    let store = redux.createStore(bsDmReducer, redux.applyMiddleware(thunk));

    // New sign
    store.dispatch(dmNewSign('VideoPlusImage', VideoMode.v1920x1080x60p, PlayerModel.XT1143));

    // Video/Images zone
    // No position rect needed - defaults to full screen
    let action = store.dispatch(dmAddZone('Zone1', ZoneType.Video_Or_Images, 'vi1'));
    let videoZoneContainer = dmGetZoneMediaStateContainer(action.payload.id);

    // Add states
    let contentItem = dmCreateMediaContentItem('SignageLiveOSSupport.jpg', '/Users/tedshaffer/Pictures/MixedMedia/SignageLiveOSSupport.jpg', MediaType.Image);
    store.dispatch(dmPlaylistAppendMediaState(videoZoneContainer, contentItem)).then (
        action => {
            contentItem = dmCreateMediaContentItem('ManWithFeet.jpg', '/Users/tedshaffer/Pictures/MixedMedia/ManWithFeet.jpg', MediaType.Image);
            return store.dispatch(dmPlaylistAppendMediaState(videoZoneContainer, contentItem));
        }
    ).then (
        action => {
            contentItem = dmCreateMediaContentItem('0arc.mp4', '/Users/tedshaffer/Pictures/MixedMedia/0arc.mp4', MediaType.Video);
            return store.dispatch(dmPlaylistAppendMediaState(videoZoneContainer, contentItem));
        }
    ).then (
        action => {
            // I can see that you moved the video event, which was added last, to the middle spot.
            // I could have added them in that order, but I decided to give the move command a workout too, so here it is
            return store.dispatch(dmPlaylistMoveMediaStateRange(videoZoneContainer, 2, 1));
        }
    ).then (
        action => {
            let output = JSON.stringify(store.getState(),null,2);
            // Write the file
            fs.writeFileSync('VideoPlusImage-v2.bpfx', output);
            console.log(inspect(store.getState(), {depth: null, colors: true}));

            // Now let's see if it is valid
            let newState = JSON.parse(output);
            let err = dmCheckForInvalidDmState(newState);
            if (err) {
                console.log('------- Error: sign state is reported as not valid, reason: ', err.message);
            }
        }
    ).catch(
        // This will capture any error from any of the Playlist actions dispatched above.
        // If action is not an Error object, it should contain a meta.reason property that is a string
        //  that describes the error
        action => {
            if (action instanceof Error) {
                console.log("Error: ", action.message);
            } else {
                const reason = action.meta && (action.meta.reason ? action.meta.reason : "<none>");
                console.log(reason);
            }
        }
    );
}

createOneZoneSign();
