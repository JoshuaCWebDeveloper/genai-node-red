import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { useAppDispatch, useAppLogic, useAppSelector } from '../../redux/hooks';
import { selectActiveFlow } from '../../redux/modules/builder/builder.slice';
import {
    SubflowEntity,
    selectFlowEntityById,
} from '../../redux/modules/flow/flow.slice';

const StyledWorkspace = styled.div`
    display: flex;
    flex-direction: column;

    color: var(--color-text-sharp);
    font-size: 0.8em;

    p {
        display: flex;
        gap: 5px;

        margin: 0;

        .type {
            font-weight: bold;
            text-transform: capitalize;
        }

        .name {
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }

        i {
            margin-left: 5px;
            color: var(--color-text-medium);
            cursor: pointer;

            &:hover {
                color: var(--color-text-sharp);
            }
        }
    }
`;

export const Workspace = () => {
    const dispatch = useAppDispatch();
    const builderLogic = useAppLogic().builder;
    const activeFlowId = useAppSelector(selectActiveFlow);
    const activeFlow = useAppSelector(state =>
        activeFlowId ? selectFlowEntityById(state, activeFlowId) : null
    );

    const handleEditClick = useCallback(() => {
        if (!activeFlowId) {
            return;
        }

        dispatch(builderLogic.editFlowEntityById(activeFlowId));
    }, [dispatch, activeFlowId, builderLogic]);

    return (
        <StyledWorkspace className="workspace">
            {activeFlow ? (
                <p>
                    <span className="type">{activeFlow.type}:</span>{' '}
                    <span className="name">{activeFlow.name} </span>
                    <i
                        className="fa-solid fa-pencil"
                        onClick={handleEditClick}
                    />
                </p>
            ) : (
                <p>No active workspace</p>
            )}
        </StyledWorkspace>
    );
};

export default Workspace;
