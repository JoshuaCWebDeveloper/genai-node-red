import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
    builderActions,
    selectEditing,
} from '../../../redux/modules/builder/builder.slice';
import { EnvironmentVariable } from '../../../redux/modules/flow/flow.slice';

export const useEditorForm = () => {
    const dispatch = useAppDispatch();
    const editing = useAppSelector(selectEditing);
    const isEditing = editing ? true : false;

    const handleCategoryChange = useCallback(
        (category: string) => {
            if (!editing) {
                return;
            }

            dispatch(builderActions.updateEditingData({ category }));
        },
        [dispatch, editing]
    );

    const handleColorChange = useCallback(
        (color: string) => {
            if (!editing) {
                return;
            }

            dispatch(builderActions.updateEditingData({ color }));
        },
        [dispatch, editing]
    );

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

    const handleIconChange = useCallback(
        (icon: string) => {
            if (!editing) {
                return;
            }

            dispatch(
                builderActions.updateEditingData({
                    icon,
                })
            );
        },
        [editing, dispatch]
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

    const handlePortLabelsChange = useCallback(
        (inputLabels: string[], outputLabels: string[]) => {
            if (!editing) {
                return;
            }

            dispatch(
                builderActions.updateEditingData({ inputLabels, outputLabels })
            );
        },
        [dispatch, editing]
    );

    return {
        editing,
        isEditing,
        category: editing?.data.category ?? '',
        handleCategoryChange,
        color: editing?.data.color ?? '',
        handleColorChange,
        description: editing?.data.info ?? '',
        handleDescriptionChange,
        environmentVariables: editing?.data.env ?? [],
        handleEnvironmentVariablesChange,
        icon: editing?.data.icon ?? '',
        handleIconChange,
        name: editing?.data.name ?? '',
        handleNameChange,
        inputLabels: editing?.data.inputLabels ?? [],
        outputLabels: editing?.data.outputLabels ?? [],
        handlePortLabelsChange,
    };
};

export default useEditorForm;
