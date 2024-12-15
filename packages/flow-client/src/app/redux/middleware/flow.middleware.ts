import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { flowActions } from '../modules/flow/flow.slice';
import { flowApi } from '../modules/api/flow.api';
import { AppLogic } from '../logic';
import { RootState } from '../store';

// Create the Node-RED sync middleware instance
export const nodeRedListener = createListenerMiddleware();

// Add a listener that responds to any flow state changes to sync with Node-RED
nodeRedListener.startListening({
    matcher: isAnyOf(
        // Flow entity actions
        flowActions.addFlowEntity,
        flowActions.updateFlowEntity,
        flowActions.removeFlowEntity,
        flowActions.addFlowEntities,
        flowActions.updateFlowEntities,
        flowActions.removeFlowEntities,
        // Flow node actions
        flowActions.addFlowNode,
        flowActions.updateFlowNode,
        flowActions.removeFlowNode,
        flowActions.addFlowNodes,
        flowActions.updateFlowNodes,
        flowActions.removeFlowNodes
    ),
    // Debounce API calls to avoid too many requests
    debounce: 1000,
    listener: async (action, listenerApi) => {
        try {
            const state = listenerApi.getState() as RootState;
            const logic = listenerApi.extra as AppLogic;

            // Convert our state to Node-RED format
            const nodeRedFlows = logic.flow.red.toNodeRed(state);

            // Update flows in Node-RED
            await listenerApi.dispatch(
                flowApi.endpoints.updateFlows.initiate(nodeRedFlows)
            );
        } catch (error) {
            // Log any errors but don't crash the app
            console.error('Error updating Node-RED flows:', error);

            // Could also dispatch an error action if needed:
            // listenerApi.dispatch(flowActions.setError('Failed to update Node-RED flows'));
        }
    },
});

export const nodeRedMiddleware = nodeRedListener.middleware;
