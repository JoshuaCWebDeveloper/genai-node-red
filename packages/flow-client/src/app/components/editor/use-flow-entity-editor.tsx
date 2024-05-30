import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    builderActions,
    selectEditing,
} from '../../redux/modules/builder/builder.slice';
import { EnvironmentVariable } from '../../redux/modules/flow/flow.slice';

export const useFlowEntityEditor = () => {
    const dispatch = useAppDispatch();
    const editing = useAppSelector(selectEditing);
    const isEditing = editing ? true : false;

    const handleDescriptionChange = useCallback(
        (description: string) => {
            if (!isEditing) {
                return;
            }

            dispatch(
                builderActions.updateEditingData({
                    info: description,
                })
            );
        },
        [dispatch, isEditing]
    );

    const handleEnvironmentVariablesChange = useCallback(
        (environmentVariables: EnvironmentVariable[]) => {
            if (!isEditing) {
                return;
            }

            dispatch(
                builderActions.updateEditingData({
                    env: environmentVariables,
                })
            );
        },
        [dispatch, isEditing]
    );

    const handleNameChange = useCallback(
        (name: string) => {
            if (!isEditing) {
                return;
            }

            dispatch(
                builderActions.updateEditingData({
                    name,
                })
            );
        },
        [dispatch, isEditing]
    );

    return {
        editing,
        isEditing,
        description: editing?.data.info ?? '',
        handleDescriptionChange,
        environmentVariables: editing?.data.env ?? [],
        handleEnvironmentVariablesChange,
        name: editing?.data.name ?? '',
        handleNameChange,
    };
};

export default useFlowEntityEditor;
