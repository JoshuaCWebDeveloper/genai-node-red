import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    EDITING_TYPE,
    builderActions,
    selectActiveFlow,
} from '../../redux/modules/builder/builder.slice';
import {
    SubflowEntity,
    selectFlowEntityById,
} from '../../redux/modules/flow/flow.slice';
import { useCallback } from 'react';

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
    const activeFlowId = useAppSelector(selectActiveFlow);
    const activeFlow = useAppSelector(state =>
        activeFlowId ? selectFlowEntityById(state, activeFlowId) : null
    );

    const handleEditClick = useCallback(() => {
        if (!activeFlowId || !activeFlow) {
            return;
        }

        dispatch(
            builderActions.setEditing({
                id: activeFlowId,
                type: {
                    flow: EDITING_TYPE.FLOW,
                    subflow: EDITING_TYPE.SUBFLOW,
                }[activeFlow.type],
                data: {
                    info: activeFlow.info,
                    name: activeFlow.name,
                    env: activeFlow.env,
                    ...{
                        flow: {},
                        subflow: {
                            color: (activeFlow as SubflowEntity).color,
                            icon: (activeFlow as SubflowEntity).icon,
                            category: (activeFlow as SubflowEntity).category,
                            inputLabels: (activeFlow as SubflowEntity)
                                .inputLabels,
                            outputLabels: (activeFlow as SubflowEntity)
                                .outputLabels,
                        },
                    }[activeFlow.type],
                },
            })
        );
    }, [dispatch, activeFlowId, activeFlow]);

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
