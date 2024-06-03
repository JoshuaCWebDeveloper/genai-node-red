import styled from 'styled-components';

import { useAppSelector } from '../../redux/hooks';
import {
    SubflowEntity,
    selectFlowEntityById,
} from '../../redux/modules/flow/flow.slice';
import { Category } from './form/category';
import { Color } from './form/color';
import { Description } from './form/description';
import { EditorForm } from './form/editor-form';
import { EnvironmentVariables } from './form/environment-variables';
import { Icon } from './form/icon';
import { Name } from './form/name';
import { PortLabels } from './form/port-labels';
import useEditorForm from './form/use-editor-form';
import { Tab, TabPresets, TabbedEditor } from './tabbed-editor';

const StyledSubflowEditor = styled(TabbedEditor)`
    .environment-variables {
        flex: 1;
    }

    .color-icon-row {
        display: flex;
        gap: 100px;
    }
`;

export type SubflowEditorProps = Record<string, never>;

// eslint-disable-next-line no-empty-pattern
export const SubflowEditor = ({}: SubflowEditorProps) => {
    const {
        editing,
        isEditing,
        description,
        handleDescriptionChange,
        environmentVariables,
        handleEnvironmentVariablesChange,
        name,
        handleNameChange,
        category,
        handleCategoryChange,
        color,
        handleColorChange,
        icon,
        handleIconChange,
        inputLabels,
        outputLabels,
        handlePortLabelsChange,
    } = useEditorForm();
    const editingSubflow = useAppSelector(state =>
        selectFlowEntityById(state, editing?.id ?? '')
    ) as SubflowEntity | undefined;

    const inputs = editingSubflow?.in?.length ?? 0;
    const outputs = editingSubflow?.out?.length ?? 0;
    const showPortLabels = inputs || outputs ? true : false;

    if (!isEditing) {
        return null;
    }

    return (
        <StyledSubflowEditor>
            <Tab {...TabPresets.properties}>
                <EditorForm>
                    <Name name={name} onChange={handleNameChange} />

                    <EnvironmentVariables
                        environmentVariables={environmentVariables}
                        onChange={handleEnvironmentVariablesChange}
                    />
                </EditorForm>
            </Tab>

            <Tab {...TabPresets.description}>
                <EditorForm>
                    <Description
                        description={description}
                        onChange={handleDescriptionChange}
                    />
                </EditorForm>
            </Tab>

            <Tab {...TabPresets.appearance}>
                <EditorForm>
                    <Category
                        category={category}
                        onChange={handleCategoryChange}
                    />

                    <div className="color-icon-row">
                        <Color color={color} onChange={handleColorChange} />

                        <Icon icon={icon} onChange={handleIconChange} />
                    </div>

                    {showPortLabels && (
                        <PortLabels
                            inputs={inputs}
                            outputs={outputs}
                            inputLabels={inputLabels}
                            outputLabels={outputLabels}
                            onChange={handlePortLabelsChange}
                        />
                    )}
                </EditorForm>
            </Tab>
        </StyledSubflowEditor>
    );
};

export default SubflowEditor;
