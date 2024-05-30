import styled from 'styled-components';

import { Description } from './form/description';
import { EditorForm } from './form/editor-form';
import EnvironmentVariables from './form/environment-variables';
import { Name } from './form/name';
import { Tab, TabPresets, TabbedEditor } from './tabbed-editor';
import { useFlowEntityEditor } from './use-flow-entity-editor';

const StyledFlowEditor = styled(TabbedEditor)`
    .environment-variables {
        flex: 1;
    }
`;

export type FlowEditorProps = Record<string, never>;

// eslint-disable-next-line no-empty-pattern
export const FlowEditor = ({}: FlowEditorProps) => {
    const {
        isEditing,
        description,
        handleDescriptionChange,
        environmentVariables,
        handleEnvironmentVariablesChange,
        name,
        handleNameChange,
    } = useFlowEntityEditor();

    if (!isEditing) {
        return null;
    }

    return (
        <StyledFlowEditor>
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
        </StyledFlowEditor>
    );
};

export default FlowEditor;
