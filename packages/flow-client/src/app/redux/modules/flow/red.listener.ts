import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import type { AppLogic } from '../../logic';
import type { AppDispatch, RootState } from '../../store';
import { flowApi } from '../api/flow.api';
import { flowActions } from './flow.slice';

// Create the Node-RED sync middleware instance
export const createRedListener = (logic: AppLogic) => {
    const nodeRedListener = createListenerMiddleware({
        extra: logic,
    });

    return nodeRedListener;
};

export const startRedListener = (
    listener: ReturnType<typeof createRedListener>
) => {
    // Add a listener that responds to any flow state changes to sync with Node-RED
    listener.startListening.withTypes<RootState, AppDispatch, AppLogic>()({
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
        effect: async (action, listenerApi) => {
            // debounce pattern
            listenerApi.cancelActiveListeners();
            await listenerApi.delay(1000);

            try {
                const state = listenerApi.getState();
                const logic = listenerApi.extra;

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
};
