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

    .row {
        display: flex;
        align-items: center;
        gap: 5px;

        margin: 0;

        label {
            font-weight: bold;
            text-transform: capitalize;
            flex: 0 0 55px;
        }
    }

    .title {
        .name {
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }

        i {
            color: var(--color-text-medium);
            cursor: pointer;

            &:hover {
                color: var(--color-text-sharp);
            }
        }
    }

    .control-group {
        display: flex;
        margin-top: 10px;

        button,
        input {
            background-color: var(--color-background-element-light);
            border: 1px solid var(--color-border-sharp);
            border-right-style: none;
            color: var(--color-text-sharp);
            cursor: pointer;
            padding: 5px 10px;
            width: 30px;
            height: 30px;

            &:first-child {
                border-radius: 2px 0 0 2px;
            }

            &:last-child {
                border-right-style: solid;
                border-radius: 0 2px 2px 0;
            }

            &.active,
            &:active {
                background-color: var(--color-background-element-medium);
                color: var(--color-active-text);
            }
        }

        input:focus {
            background-color: var(--color-background-element-focus);
            outline: 0;
        }
    }
`;

export const Workspace = () => {
    const dispatch = useAppDispatch();
    const builderLogic = useAppLogic().builder;
    const flowLogic = useAppLogic().flow;
    const activeFlowId = useAppSelector(selectActiveFlow);
    const activeFlow = useAppSelector(state =>
        activeFlowId ? selectFlowEntityById(state, activeFlowId) : null
    );

    const inputs = (activeFlow as SubflowEntity)?.in?.length ?? 0;
    const outputs = (activeFlow as SubflowEntity)?.out?.length ?? 0;
    const [currentOutputs, setCurrentOutputs] = useState(outputs);

    const handleEditClick = useCallback(() => {
        if (!activeFlowId) {
            return;
        }

        dispatch(builderLogic.editFlowEntityById(activeFlowId));
    }, [dispatch, activeFlowId, builderLogic]);

    const handleInputsChange = useCallback(
        (inputs: number) => {
            if (!activeFlowId || !activeFlow || activeFlow.type !== 'subflow') {
                return;
            }

            dispatch(flowLogic.updateSubflowInputs(activeFlow, inputs));
        },
        [activeFlow, activeFlowId, dispatch, flowLogic]
    );

    const handleOutputsChange = useCallback(
        (outputs: number) => {
            if (!activeFlowId || !activeFlow || activeFlow.type !== 'subflow') {
                return;
            }

            dispatch(flowLogic.updateSubflowOutputs(activeFlow, outputs));
        },
        [activeFlow, activeFlowId, dispatch, flowLogic]
    );

    const handleIncrementOutputs = useCallback(() => {
        const newOutputs = currentOutputs + 1;
        setCurrentOutputs(newOutputs);
        handleOutputsChange(newOutputs);
    }, [currentOutputs, handleOutputsChange]);

    const handleDecrementOutputs = useCallback(() => {
        const newOutputs = Math.max(currentOutputs - 1, 0);
        setCurrentOutputs(newOutputs);
        handleOutputsChange(newOutputs);
    }, [currentOutputs, handleOutputsChange]);

    const handleCurrentOutputsChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newOutputs = Number(e.target.value);
            setCurrentOutputs(
                Math.max(isNaN(newOutputs) ? currentOutputs : newOutputs, 0)
            );
        },
        [currentOutputs]
    );

    const handleOutputsSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            e.currentTarget.querySelector('input')?.blur();

            handleOutputsChange(currentOutputs);
        },
        [currentOutputs, handleOutputsChange]
    );

    useEffect(() => {
        setCurrentOutputs(outputs);
    }, [outputs]);

    return (
        <StyledWorkspace className={`workspace ${activeFlow?.type ?? ''}`}>
            {!activeFlow ? (
                <p className="empty">No active workspace</p>
            ) : (
                <>
                    <div className="row title">
                        <label className="type">{activeFlow.type}:</label>{' '}
                        <span className="name">{activeFlow.name} </span>
                        <i
                            className="fa-solid fa-pencil"
                            onClick={handleEditClick}
                        />
                    </div>

                    {activeFlow.type === 'subflow' && (
                        <>
                            <div className="row inputs">
                                <label>Inputs: </label>
                                <span className="control-group">
                                    <button
                                        type="button"
                                        className={inputs === 0 ? 'active' : ''}
                                        onClick={() => handleInputsChange(0)}
                                    >
                                        0
                                    </button>

                                    <button
                                        type="button"
                                        className={inputs === 1 ? 'active' : ''}
                                        onClick={() => handleInputsChange(1)}
                                    >
                                        1
                                    </button>
                                </span>
                            </div>

                            <div className="row outputs">
                                <label>Outputs: </label>
                                <form
                                    className="control-group"
                                    onSubmit={handleOutputsSubmit}
                                    onBlur={handleOutputsSubmit}
                                >
                                    <button
                                        type="button"
                                        onClick={handleDecrementOutputs}
                                    >
                                        -
                                    </button>

                                    <input
                                        type="text"
                                        value={currentOutputs}
                                        onChange={handleCurrentOutputsChange}
                                    />

                                    <button
                                        type="button"
                                        onClick={handleIncrementOutputs}
                                    >
                                        +
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </>
            )}
        </StyledWorkspace>
    );
};

export default Workspace;
